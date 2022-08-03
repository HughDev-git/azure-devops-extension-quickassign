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
import { Project} from "./CurrentProject";
import { Host} from "./CurrentHost";
import { SearchBox } from "@fluentui/react/lib/SearchBox";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import {WorkItemTrackingRestClient} from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
import { IWorkItemFieldChangedArgs, IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemRelation } from "azure-devops-extension-api/WorkItemTracking";
import { Link, Stack, StackItem, MessageBar, MessageBarType, ChoiceGroup, IStackProps, MessageBarButton, Text, IChoiceGroupStyles, ThemeProvider, initializeIcons } from "@fluentui/react";
import { getClient } from "azure-devops-extension-api";
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



interface MyStates {
  IsRenderReady: boolean;
  UsersNotAssigned: ArrayItemProvider<ITableItem>
  UsersAssigned: ArrayItemProvider<ITableItem>
}





export class QuickAssignComponent0 extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
     this.state = {
       IsRenderReady: false,
       UsersNotAssigned: new ArrayItemProvider<ITableItem>([]),
       UsersAssigned: new ArrayItemProvider<ITableItem>([])
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
        this.assignSelectedUsers()
      },
      text: "Assign",
      tooltipProps: {
        text: "Assign the selected resources this onboarding activity"
      }
    }
  ];



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

  public async assignSelectedUsers(){
    let selectedItems = this.selection.value
    let a = this.selection.value[0].beginIndex
    // console.log(this.selection)
    for (let i of selectedItems){
      
      //there is only a single item
       if (i.beginIndex == i.endIndex){
        console.log("A selected Users Display Name is:  " + this.state.UsersNotAssigned.value[i.beginIndex].displayName)
       } else {
        //we must loop through each item as more than one item was selected
        let counter = i.beginIndex
          do {
            console.log("A selected Users Display Name is:  " + this.state.UsersNotAssigned.value[counter].displayName)
            counter++
          } while (counter <= i.endIndex);
        }
    }
  }

  public async fetchAllJSONData(){
    let usersnotassignedplaceholder = new Array<ITableItem>();
    let usersassignedplaceholder = new Array<ITableItem>();
    const users = (await userAssignments)
    for (let user of users) {
      if(user.isAssignedActivity == "1"){
        usersassignedplaceholder.push({ "displayName": user.identity.identity.displayName, "descriptor": user.identity.identity.descriptor, "isAssignedActivity": user.isAssignedActivity})
      } else {
        usersnotassignedplaceholder.push({ "displayName": user.identity.identity.displayName, "descriptor": user.identity.identity.descriptor, "isAssignedActivity": user.isAssignedActivity})
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
      </div>);} 
    else {
      return (<div className="flex-row"></div>)

    }
    
  }


  // private renderRow = (
  //   index: number,
  //   item: ITaskItem,
  //   details: IListItemDetails<ITaskItem>,
  //   key?: string
  // ): JSX.Element => {
  //   return (
  //     <ListItem
  //       key={key || "list-item" + index}
  //       index={index}
  //       details={details}
  //     >
  //       <div className="list-example-row flex-row h-scroll-hidden">
  //         <div
  //           style={{ padding: "5px 0px" }}
  //           className="flex-column h-scroll-hidden"
  //         >
  //           <span className="fontSizeMS font-size-ms text-ellipsis" style={{ paddingLeft: "5px" }}>
  //             {item.title}
  //           </span>
  //           <span className="fontSizeMS font-size-ms text-ellipsis secondary-text" style={{ paddingLeft: "5px" }}>
  //             {item.areapathshort}
  //           </span>
  //         </div>
  //       </div>
  //     </ListItem>
  //   );
  // };
}

export default QuickAssignComponent0;

showRootComponent(<QuickAssignComponent0 />);

