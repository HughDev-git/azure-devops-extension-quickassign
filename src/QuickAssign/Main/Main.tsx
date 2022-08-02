import * as React from "react";
import "./quickassign.scss"
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
import QuickAssignComponent0 from "./NotAssignedComp";
import QuickAssignComponent1 from "./IsAssignedComp";



interface MyStates {
  View: string;
  isRenderReady: boolean;
}

export class Main extends React.Component<{}, MyStates>{
  constructor(props: {}) {
    super(props);
    this.state = {
      View: "",
      isRenderReady: false
    };
  }

  public componentDidMount() {
    SDK.init().then(() => {
        this.fetchWITInput()
        this.isRenderReady();
    })
  // })
}

  public fetchWITInput(){
        let view = SDK.getConfiguration().witInputs["ColumnType"]
        this.setState({
          View: view
          // StoryRecordsArray: storiesplaceholder
        });
  }
  public isRenderReady(){
    this.setState({
      isRenderReady: true
      // StoryRecordsArray: storiesplaceholder
    });
  }

  public render(): JSX.Element {
      if (this.state.isRenderReady && this.state.View === "NOT ASSIGNED"){
       return (<QuickAssignComponent0/>)
    } else if (this.state.isRenderReady && this.state.View === "ASSIGNED"){
       return (<QuickAssignComponent1/>)}
      else {
       return (<div className="flex-row"></div>)
    }
  }
}

// function determineViewToRender(){
//     View = SDK.getConfiguration().witInputs["View Type"]
//     console.log("We are loading the following view: "+ View)
// }

export default Main;
showRootComponent(<Main/>);

