import React, { Component } from "react";
import "./Home.css";
import { Button } from "react-bootstrap";
import SequenceUploadModal from "../components/SequenceUploadModal";
import { API } from "aws-amplify";
import AlignmentTable from "../components/AlignmentTable";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false, tableRows: [] };
  }
  handleClose = () => {
    this.setState({ show: false });
    this.refreshTable();
  };
  handleShow = event => {
    this.setState({ show: true });
  };

  refreshTable = () => {
    API.get("list", "/list")
      .then(resp =>
        this.setState({
          tableRows: resp.sort((a, b) => b.createdAt - a.createdAt)
        })
      )
      .catch(err => alert(err));
  };
  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }
    this.refreshTable();
  }

  render() {
    if (!this.props.isAuthenticated) {
      return (
        <div className="Home">
          <div className="lander">
            <h2>Please log in or sign up to use this app.</h2>
          </div>
        </div>
      );
    }
    return (
      <div className="Home">
        <div className="lander">
          <Button
            onClick={this.handleShow}
            variant="primary"
            style={{ marginBottom: "30px" }}
          >
            Search new sequence
          </Button>
          <SequenceUploadModal
            show={this.state.show}
            onHide={this.handleClose}
            alignmentComplete={this.refreshTable}
          />
          <AlignmentTable tableRows={this.state.tableRows} />
        </div>
      </div>
    );
  }
}
