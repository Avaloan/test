async getViewerRole(saleId: number, viewer?: User) {
  if (!viewer) {
    return 'anonymous';
  }

  const sale = await this.repo.findOneOrFail(saleId, {
    relations: ['memberships']
  });

  const membership = sale.memberships.find(m => m.userId === viewer.id);

  if (!membership) {
    return 'visitor';
  } else {
    return membership.type;
  }
}

async getSaleViewerMembership(saleId: number, viewerId: string) {
  const membership = await this.saleMembershipService
    .getQueryBuilder()
    .where('"userId" = :viewerId')
    .andWhere('"saleId" = :saleId')
    .setParameters({
      viewerId,
      saleId
    })
    .getOne();

  return membership;
}

async getSaleViewerSaleApplication(saleId: number, viewerId: string) {
  const saleApplication = await this.saleApplicationService
    .getQueryBuilder()
    .where('saleApplication.userId = :viewerId')
    .andWhere('saleApplication.saleId = :saleId')
    .setParameters({
      viewerId,
      saleId
    })
    .getOne();

  return saleApplication;
}

async getSaleSellerMembership(saleId: number) {
  const membership = await this.saleMembershipService
    .getQueryBuilder()
    .where(`type = 'seller'`)
    .getOne();

  return membership;
}