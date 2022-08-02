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
import {
  IWorkItemFormService,
  WorkItemExpand,
  WorkItemRelation,
  WorkItemTrackingRestClient,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";

export interface ITableItem extends ISimpleListCell {
  displayName: string;
  descriptor: string;
  isAssignedActivity: boolean;
  linkItemInterface: WorkItemRelation[] 
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

let usersInGroup = retrieveUsers();
let childActivities = retrieveChildItems();

async function retrieveUsers(){
  const users = await getMembersOfTeam()
  return users
}

async function retrieveChildItems(){
  const users = await getMembersOfTeam()
  return users
}

async function getChildItems(){
  const workItemFormService = await SDK.getService<IWorkItemFormService>(
    WorkItemTrackingServiceIds.WorkItemFormService
  );
  // const organization = await SDK.getHost()
  // const project = await Project
  let placeholder = new Array<ITableItem>()
  const client = getClient(WorkItemTrackingRestClient);
  let relations = await workItemFormService.getWorkItemRelations();
  for (let item of relations){
    console.log("Attributes: "+item.attributes+" ||| Link Type: "+item.rel+" ||| URL: "+item.url)
    if(item.rel == "System.LinkTypes.Hierarchy-Forward"){
      //Get the id from end of string
      var matches : number;
      matches = parseInt(item.url.match(/\d+$/)?.toString()||"")
      console.log(matches);
      client.getWorkItemTypeFieldsWithReferences
      let workitem = client.getWorkItem(matches, undefined, undefined, new Date(), WorkItemExpand.Relations)
      let assignedTo = (await workitem).fields["System.AssignedTo"]
      console.log(assignedTo)
      return assignedTo
}
}
}

export const usersAssigned = usersInGroup
export const getChildItems1 = childActivities

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