import { IdentityRef, TeamMember } from "azure-devops-extension-api/WebApi";
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
import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import {Project} from "./CurrentProject"

export interface ITableItem extends ISimpleTableCell {
  displayName: string;
  descriptor: string;
  isAssignedActivity: string;
  uniqueName: string;
  // linkItemInterface: WorkItemRelation[] 
}

export interface IUserItem<T = {}> {
    identity: TeamMember;
    isAssignedActivity: string;
    //linkItemInterface?: WorkItemRelation[] 
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

interface IWorkItemExtended extends WorkItem {
  item: WorkItem;
  assignedToUniqueName: string;
}

interface ExtensionConfigs {
  group: string;
  type: string;
}

let usersInGroup = retrieveUsers();
let childActivities = retrieveChildItems();
let findAssignmentOfUsers = determineAssignmentOfUsers();

async function determineAssignmentOfUsers(){
const AllUsers = (await usersInGroup)
const AllActivities = (await childActivities)
let placeholder = new Array<IUserItem>();
for (let user of AllUsers) {
  //determine if already assigned
  let matched = AllActivities?.find((i) => i.assignedToUniqueName === user.identity.uniqueName)?.assignedToUniqueName || ""
  console.log("Test Match HERE");
  if (matched) {
    placeholder.push({"identity": user, "isAssignedActivity": "1"})
  } else {
    placeholder.push({"identity": user, "isAssignedActivity": "0"})
  }
}
return placeholder
}

async function retrieveUsers(){
  const users = await getMembersOfTeam()
  return users
}

async function retrieveChildItems(){
  const childItems = await getChildItems()
  return childItems
}

async function getChildItems(){
  const workItemFormService = await SDK.getService<IWorkItemFormService>(
    WorkItemTrackingServiceIds.WorkItemFormService
  );
  // const organization = await SDK.getHost()
  // const project = await Project
  let placeholder = new Array<IWorkItemExtended>()
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
      let workitemAsync = client.getWorkItem(matches, undefined, undefined, new Date(), WorkItemExpand.Relations)
      let workitem = (await workitemAsync)
      let assignedToUniqueName = workitem.fields["System.AssignedTo"].uniqueName;
      console.log("HERE IS ASSIGNED TO UNIQUE NAME:  " + assignedToUniqueName)
      placeholder.push({"item": workitem, assignedToUniqueName: assignedToUniqueName})
      // let assignedTo = (await workitem).fields["System.AssignedTo"]
      // //console.log("HERE IS THE ASSIGNED TO: " + assignedTo)
}
}
return placeholder
}

export const usersAssigned = usersInGroup
export const getChildItems1 = childActivities
export const userAssignments = findAssignmentOfUsers


 async function getMembersOfTeam(){
  const client = getClient(CoreRestClient)
  const groupName =  await SDK.init().then( () =>SDK.getConfiguration().witInputs["GroupName"]);
  let project = await Project
  let users = await client.getTeamMembersWithExtendedProperties(project?.name || "", groupName)
  return users
}
function createColumnSelect<T>(): ITableColumn<T> {
  /* workaround incompatible types */
  return new ColumnSelect() as unknown as ITableColumn<T>
}

async function retrieveConfigs(){
  const columnType =  await SDK.init().then( () =>SDK.getConfiguration().witInputs["ColumnType"]);
  const groupName =  await SDK.init().then( () =>SDK.getConfiguration().witInputs["GroupName"]);
  const config: ExtensionConfigs = {group: groupName, type: columnType}
  return config
}
  
  export const MSStoryData: IUserItem[] = [
  ];

  export const rawTableItems: ITableItem[] = [
  ];