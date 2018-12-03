ensureOwnerCanSale(
  estate: Estate,
  sellerType: string,
  sellerId: string
): void {
  if (estate.companyOwnerId) {
    if (sellerType !== 'Company') {
      throw new Error(CANNOT_SELL_A_COMPANY_ESTATE_AS_USER);
    } else if (parseInt(sellerId, 10) !== estate.companyOwnerId) {
      throw new Error(CANNOT_SELL_AN_ESTATE_YOU_DONT_OWN);
    }
  } else if (estate.userOwnerId) {
    if (sellerType !== 'User') {
      throw new Error(CANNOT_SELL_A_USER_ESTATE_AS_A_COMPANY);
    } else if (sellerId !== estate.userOwnerId) {
      throw new Error(CANNOT_SELL_AN_ESTATE_YOU_DONT_OWN);
    }
  } else {
    throw new Error(CANNOT_SELL_A_ROGUE_ESTATE);
  }
}

async ensureEstateCanBeSold(estateId: number) {
  const sale = await this.repo.findOne({
    where: `"estateId" = ${estateId}`
  });

  return !sale;
}
// le ensureOwner devrait etre un checks de owner pareil pour ensureEstate devrait etre un check de estate que l'on peux utiliser la
// ou on en a besoin avec un import qui le rendrait disponible