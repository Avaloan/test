export class testPropsCols {
  @Column({ nullable: true })
  public publishedAt?: Date;

  @Column({ nullable: true, type: "date" })
  public loiDepositDeadline?: string;

  @Column({ nullable: true, type: "bigint" })
  public priceAmount?: number;

  @Column({
    enum: ["EUR"],
    default: "EUR",
    nullable: true
  })
  public priceCurrency?: "EUR";
}
