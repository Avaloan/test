// exemple saleNdaAccept
// Pouvoir prendre en import les 'fonctions' necessaires des autres services

/**
   * @throws {UNAUTHORIZED} if membership is null or membership.type is not seller
   */
  async saleNdaAccept(
    input: SaleNdaAcceptDTO,
    viewer: User
  ): Promise<SaleMembership> {
    // Sanitize inputs
    const { saleId } = input;

    // Init
    const membership = new SaleMembership();

    // Fetch
    const application = await this.getSaleViewerSaleApplication(
      saleId,
      viewer.id
    );

    const existingMembership = await this.getSaleViewerMembership(
      saleId,
      viewer.id
    );

    if (existingMembership || !application || !application.acceptedAt) {
      throw new Error(UNAUTHORIZED);
    }

    // Assignations
    membership.ndaAcceptedAt = new Date();
    membership.saleId = saleId;
    membership.userId = viewer.id;
    membership.type = 'buyer';
    await this.saleMembershipService.save(membership);

    // TODO: Save action

    // return
    return membership;
  }