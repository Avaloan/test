// update/create/delete UNIQUEMENT CE QUI CONCERNE L'ENTITE EN QUESTION
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Sale } from "./sale.entity";
import { User } from "../user/user.entity";
import { SaleMembershipService } from "../saleMembership/saleMembership.service";
import { EstateService } from "../estate/estate.service";
import { CompanyService } from "../company/company.service";
import {
  SELLER_ID_IS_NOT_A_NUMBER,
  CANNOT_SELL_A_ROGUE_ESTATE,
  CANNOT_SELL_AN_ESTATE_YOU_DONT_OWN,
  CANNOT_SELL_A_USER_ESTATE_AS_A_COMPANY,
  CANNOT_SELL_A_COMPANY_ESTATE_AS_USER,
  CANNOT_DELETE_PUBLISHED_SALE,
  CANNOT_UPDATE_PUBLISHED_SALE,
  UNAUTHORIZED
} from "../common/errors";
import { sanitize } from "class-sanitizer";
import { Estate } from "../estate/estate.entity";
import {
  SaleDeleteDTO,
  SaleCreateDTO,
  SaleUpdateDTO,
  SaleNdaAcceptDTO
} from "./sale.dto";
import { SaleMembership } from "../saleMembership/saleMembership.entity";
import { SaleApplicationService } from "../saleApplication/saleApplication.service";

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly repo: Repository<Sale>
  ) {}

  /**
   * @throws {CANNOT_DELETE_PUBLISHED_SALE} if sale is published
   */
  async delete(input: SaleDeleteDTO, viewer: User) {
    const sale = await this.repo.findOneOrFail(input.saleId);

    if (sale.publishedAt) {
      throw new Error(CANNOT_DELETE_PUBLISHED_SALE);
    }

    await this.repo.delete(sale.id);

    return sale;
  }

  /**
   * @throws {UNAUTHORIZED} if not membership or membership type is not seller
   */
  async update(input: SaleUpdateDTO, viewer: User): Promise<Sale> {
    const { saleId, price, ...values } = input;

    const sale = await this.repo.findOneOrFail(saleId);

    if (sale.publishedAt) {
      throw new Error(CANNOT_UPDATE_PUBLISHED_SALE);
    }

    if (price) {
      sale.priceCurrency = price.currency;
      sale.priceAmount = price.amount;
    }

    Object.assign(sale, values);

    await this.repo.save(sale);

    return sale;
  }

  /**
   * @throws {SELLER_ID_IS_NOT_A_NUMBER} if sellerType is company and sellerId is a user id
   * @throws {MISSING_ROLE} if user dont have the rights
   * @throws {CANNOT_SELL_A_COMPANY_ESTATE_AS_USER} if estate companyOwner && sellerType is not Company
   * @throws {CANNOT_SELL_AN_ESTATE_YOU_DONT_OWN} if estate companyOwner && sellerId is not estate.companyOwnerId
   * @throws {CANNOT_SELL_A_USER_ESTATE_AS_A_COMPANY} if estate userOwner && sellerType is not User
   * @throws {CANNOT_SELL_A_ROGUE_ESTATE} if !estate.userOwner && !estate.companyOwner (What the hell ?)
   */
  async create(input: SaleCreateDTO, viewer: User): Promise<Sale> {
    // Sanitize inputs
    const { sellerType, estateId, sellerId, price, ...values } = input;

    // Init
    const sale = new Sale();

    // Fetch
    const estate = await this.estateService.findOneById(estateId);

    // Checks
    await this.estateService.ensureEstateCanBeSold(estate);
    this.ensureOwnerCanSale(estate, sellerType, sellerId);

    if (sellerType === "Company") {
      const companyId = parseInt(sellerId, 10);

      if (Number.isNaN(companyId)) {
        throw new Error(SELLER_ID_IS_NOT_A_NUMBER);
      }

      if (companyId === estate.companyOwnerId) {
        await this.companyService.ensureUserHasRole(
          companyId,
          viewer.id,
          "ADMIN"
        );
        sale.companyOwnerId = companyId;
      }
    } else if (sellerType === "User" && estate.userOwnerId === sellerId) {
      sale.userOwnerId = sellerId;
    }

    // Relation
    sale.estateId = estateId;

    // Assignations
    Object.assign(sale, { ...values, ...price });

    // Before insert checks
    sanitize(sale);

    // Before insert actions

    // Insert
    await this.repo.save(sale);

    await this.saleMembershipService.create({
      type: "seller",
      user: viewer,
      saleId: sale.id,
      ndaAcceptedAt: new Date()
    });

    // Post insert actions
    // TODO: Save action

    // Return
    return sale;
  }
}
