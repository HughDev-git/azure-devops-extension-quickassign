import * as React from "react";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem,
  IListRow
} from "azure-devops-ui/List";
import "./quickassign.scss"
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
// import { Icon, IconSize } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { IUserItem, MSStoryData, rawTableItems, ITableItem, fixedColumns, userAssignments } from "./Data";
import { Host} from "./CurrentHost";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import {WorkItemTrackingRestClient} from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
import { IWorkItemFieldChangedArgs, IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemRelation } from "azure-devops-extension-api/WorkItemTracking";
import { Link, Stack, StackItem, MessageBar, MessageBarType, ChoiceGroup, IStackProps, MessageBarButton, Text, IChoiceGroupStyles, ThemeProvider, initializeIcons, ProgressIndicator} from "@fluentui/react";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { getClient, IProjectInfo } from "azure-devops-extension-api";
import { Page } from "azure-devops-ui/Page";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { Table } from "azure-devops-ui/Table";
import {
  ColumnSelect,
  renderSimpleCell,
  TableColumnLayout,
  ISimpleTableCell
} from "azure-devops-ui/Table";
import { ISimpleListCell } from "azure-devops-ui/List";
import {Project} from "./CurrentProject"



interface MyStates {
  IsRenderReady: boolean;
  UsersNotAssigned: ArrayItemProvider<ITableItem>
  UsersAssigned: ArrayItemProvider<ITableItem>
  assigningIndicator: boolean
  currentUserAssignment: string
  currentUserAssignmentID: number
  assigningComplete: boolean
  // reRender: number
}



export class QuickAssignComponent0 extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
     this.state = {
       IsRenderReady: false,
       UsersNotAssigned: new ArrayItemProvider<ITableItem>([]),
       UsersAssigned: new ArrayItemProvider<ITableItem>([]),
       assigningIndicator: false,
       currentUserAssignment: "",
       currentUserAssignmentID: 0,
       assigningComplete: false
      //  reRender: 0
     };

    
  }


  private commandBarItemsSimple: IHeaderCommandBarItem[] = [
    {
      iconProps: {
        iconName: "Add"
      },
      id: "Assign",
      isPrimary: true,
      important: true,
      onActivate: () => {
        this.assignSelectedUsers().then(() => { 
          this.updateLists()})
      },
      // onActivate: () => {
      //   this.assignSelectedUsers()},
      // text: "Assign",
      // tooltipProps: {
      //   text: "Assign the selected resources this onboarding activity"
      // }
    }
  ];

  // setTimeout(function(){ window.location.reload(); }, 4000)

  private selection = new ListSelection({
    selectOnFocus: false,
    multiSelect: true
  });


  public componentDidMount() {
    SDK.init().then(() => {
      //this.registerEvents();
      initializeIcons();
      this.fetchAllJSONData().then(() => {
      this.buildWidget()
      // this.forceUpdate();
      // this.projectQueries();
        })
    })
  }

  public buildWidget() {
    this.setState({
      IsRenderReady: true,
    });
  }

  public updateLists(){
    this.setState({
      assigningIndicator: false,
      assigningComplete: true
    });
  }

  public async assignSelectedUsers(){
    this.setState({
      assigningIndicator: true,
    });
    let selectedItems = this.selection.value
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
    let parentItemID = (await workItemFormService.getId());
    //const project = await Project || ""
    let project = (await Project)
    let host = (await Host)
    const urlBuilder = "https://dev.azure.com/"+host.name+"/"+project?.name+"/_apis/wit/workItems/"+parentItemID;
    const addlinkInterfaceItem : WorkItemRelation[] =
    [
      {
        rel: "System.LinkTypes.Hierarchy-Reverse",
        url: urlBuilder,
        attributes: [""]
        }
    ]
    const client = getClient(WorkItemTrackingRestClient);
    let osTitle = (await workItemFormService.getFieldValue("System.Title")).toString();
    let newTitle = ""
    if (osTitle.startsWith("OS")) {
      let a = osTitle.replace("OS","OA")
      newTitle = a
    } else {
      newTitle = osTitle
    }
    
    for (let i of selectedItems){
      //there is only a single item
       if (i.beginIndex == i.endIndex){
        this.setState({
          currentUserAssignment: this.state.UsersNotAssigned.value[i.beginIndex].displayName,
        });
        (await this.createWorkItem(client,project,newTitle, addlinkInterfaceItem,this.state.UsersNotAssigned.value[i.beginIndex]));
        // usersnotassignedplaceholder.splice(i.beginIndex);
        // usersassignedplaceholder.push({ "displayName": this.state.UsersNotAssigned.value[i.beginIndex].displayName, "uniqueName": this.state.UsersNotAssigned.value[i.beginIndex].uniqueName, "descriptor": this.state.UsersNotAssigned.value[i.beginIndex].descriptor, "isAssignedActivity": this.state.UsersNotAssigned.value[i.beginIndex].isAssignedActivity})
       } else {
        //we must loop through each item as more than one item was selected
        let counter = i.beginIndex
          do {
            this.setState({
              currentUserAssignment: this.state.UsersNotAssigned.value[counter].displayName,
            });
            (await this.createWorkItem(client,project,newTitle,addlinkInterfaceItem,this.state.UsersNotAssigned.value[counter]));
            // usersnotassignedplaceholder.splice(counter)
            // usersassignedplaceholder.push({ "displayName": this.state.UsersNotAssigned.value[counter].displayName, "uniqueName": this.state.UsersNotAssigned.value[counter].uniqueName, "descriptor": this.state.UsersNotAssigned.value[counter].descriptor, "isAssignedActivity": this.state.UsersNotAssigned.value[counter].isAssignedActivity})
            counter++
          } while (counter <= i.endIndex);
        }
    }
}

public getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

  public async createWorkItem(client: WorkItemTrackingRestClient, project: IProjectInfo | undefined, newTitle: string | undefined, addlinkInterfaceItem: WorkItemRelation[], user: ITableItem | undefined){
    let distinctDisplayName = user?.displayName+"<"+user?.uniqueName+">"
    // let jsonPatchDoc = [  {"op": "test","path": "/rev","value": 3},{"op": "add","path":"/fields/System.Title","value":"HERE IS MY NEW TITLE"}]
    let jsonPatchDoc = [{"op": "add","path":"/fields/System.Title","value": newTitle},{"op": "add","path":"/fields/System.AssignedTo","value": distinctDisplayName},{"op": "add","path": "/relations/-","value": {"rel": addlinkInterfaceItem[0].rel,"url": addlinkInterfaceItem[0].url,"attributes": {"comment": "This item was linked from the QuickAssign Azure DevOps extension."}}}]
       //console.log("Attributes: "+item.attributes+" ||| Link Type: "+item.rel+" ||| URL: "+item.url)
        // var matches : number;
        // matches = parseInt(item.url.match(/\d+$/)?.toString()||"")
        // let workitem = await (client.getWorkItem(matches))
        // var state : string;
        // state = workitem.fields["System.State"]
        // console.log(state)
        // if (state != "Yes - I fully meet this requirement" && state != "N/A - This requirement does not apply to me") {
        //   console.log("Resetting. This state is :  " + state)
        // client.createWorkItem
        let createdItem = (await client.createWorkItem(jsonPatchDoc,project?.id || "","Onboarding Activity"))
        setTimeout(function(){ console.log("Activity has been created. Item ID:  " + createdItem.id) }, this.getRandomInt(2000,5000))
        //  let createdItem = (await client.createWorkItem(jsonPatchDoc,project?.id || "","Onboarding Activity"));
        }

  public async fetchAllJSONData(){
    console.log("Entering fetch all JSON data")
    let usersnotassignedplaceholder = new Array<ITableItem>();
    let usersassignedplaceholder = new Array<ITableItem>();
    const users = (await userAssignments)
    for (let user of users) {
      if(user.isAssignedActivity == "1"){
        usersassignedplaceholder.push({ "displayName": user.identity.identity.displayName, "uniqueName": user.identity.identity.uniqueName, "descriptor": user.identity.identity.descriptor, "isAssignedActivity": user.isAssignedActivity})
      } else {
        usersnotassignedplaceholder.push({ "displayName": user.identity.identity.displayName, "uniqueName": user.identity.identity.uniqueName, "descriptor": user.identity.identity.descriptor, "isAssignedActivity": user.isAssignedActivity})
      }
    
    }
    let arrayItemProvider0 = new ArrayItemProvider(usersnotassignedplaceholder)
    let arrayItemProvider1 = new ArrayItemProvider(usersassignedplaceholder)
    this.setState({
      UsersNotAssigned: arrayItemProvider0,
      UsersAssigned: arrayItemProvider1
    });
  }
  


  public render(): JSX.Element {
    if (this.state.IsRenderReady){
    return (
      <div>
        <Page>
        {this.state.assigningIndicator ? <ProgressIndicator label="DO NOT REFRESH. ASSIGNMENTS ARE IN PROGRESS" description={"Assigning To:  " + this.state.currentUserAssignment} /> : ""}
        {this.state.assigningComplete?  <MessageBar
            messageBarType={MessageBarType.success}
            isMultiline={true}
            dismissButtonAriaLabel="Close"
            >
            Good to go! Refresh this page to see the new assignments.
            </MessageBar> : ""}
        <Header
        // title={"Header title"}
         commandBarItems={this.commandBarItemsSimple}
        // titleSize={TitleSize.Medium}
        // titleIconProps={{ iconName: "OpenSource" }}
        // titleAriaLevel={3}
        />
        <Card
          className="flex-grow bolt-table-card"
          contentProps={{ contentPadding: false }}
        >
          <Table
            ariaLabel="Basic Table"
            columns={fixedColumns}
            itemProvider={this.state.UsersNotAssigned}
            role="table"
            selection={this.selection}
            className="table-example"
            containerClassName="h-scroll-auto"
          />
        </Card>    
      </Page>
      </div>
      );
      }
      return (<div className="flex-row"></div>)

  }


  }


export default QuickAssignComponent0;

showRootComponent(<QuickAssignComponent0 />);

