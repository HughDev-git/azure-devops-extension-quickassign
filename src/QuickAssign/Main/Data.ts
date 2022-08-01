import { IdentityRef } from "azure-devops-extension-api/WebApi";
import { ISimpleListCell } from "azure-devops-ui/List";
import {
  ColumnMore,
  ColumnSelect,
  ISimpleTableCell,
  ITableColumn,
  renderSimpleCell,
  TableColumnLayout
} from "azure-devops-ui/Table";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { getClient } from "azure-devops-extension-api";
import { CoreRestClient } from "azure-devops-extension-api/Core/CoreClient";

export interface ITableItem extends ISimpleTableCell {
  displayName: string;
  descriptor: string;
}

export interface IUserItem<T = {}> {
    identity: IdentityRef
    name: string
}

export const fixedColumns = [
   createColumnSelect<ITableItem>(),
  {
    columnLayout: TableColumnLayout.singleLinePrefix,
    id: "displayName",
    name: "Name",
    readonly: true,
    renderCell: renderSimpleCell,
    width: new ObservableValue(-30)
  }
  // new ColumnMore(() => {
  //   return {
  //     id: "sub-menu",
  //     items: [{ id: "assign", text: "Assign" }]
  //   };
  // })
];

let usersInGroup = main();

async function main(){
  const users = await getMembersOfTeam()
  return users

}

export const usersAssigned = usersInGroup

 async function getMembersOfTeam(){
  const client = getClient(CoreRestClient)
  let users = await client.getTeamMembersWithExtendedProperties("Master Template","My Test Team")
  return users
}
function createColumnSelect<T>(): ITableColumn<T> {
  /* workaround incompatible types */
  return new ColumnSelect() as unknown as ITableColumn<T>
}
  
  export const MSStoryData: IUserItem[] = [
  ];

  export const rawTableItems: ITableItem[] = [
  ];