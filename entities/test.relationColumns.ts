export class testRelCols {
  @OneToOne(type => Estate, { nullable: false })
  @JoinColumn()
  public estate: Estate;

  @Column()
  public estateId: number;

  @OneToOne(type => File)
  @JoinColumn()
  public memorandum?: File;

  @Column({ nullable: true })
  public memorandumId?: number;

  @ManyToOne(type => User, user => user.sales)
  @JoinColumn()
  public userOwner?: User;

  @Column({ nullable: true })
  public userOwnerId?: string;

  @ManyToOne(type => Company, company => company.sales)
  @JoinColumn()
  public companyOwner?: Company;

  @Column({ nullable: true })
  public companyOwnerId?: number;

  @OneToMany(type => SaleMembership, membership => membership.sale)
  public memberships: SaleMembership[];

  @OneToMany(type => SaleApplication, saleApplication => saleApplication.sale)
  public applications: SaleApplication[];
}
