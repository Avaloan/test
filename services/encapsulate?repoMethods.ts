export class EncapsulateRepo {
  private readonly repo: Repository<Test>;
  constructor(repo: Repository<Test>) {
    this.repo = repo;
  }
  async getQueryBuilder(alias: string = "sale", repo: Repository<Test>) {
    return repo.createQueryBuilder(alias);
  }
}
