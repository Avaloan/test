import { testRelCols } from "./test.relationColumns";
import { testPropsCols } from "./test.propertyColumns";

@Entity()
export class Sale extends Ressource {
  @Column(type => testPropsCols)
  properties: testPropsCols;

  @Column(type => testRelCols)
  relations: testRelCols;
}
