import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import LoaderButton from "./LoaderButton";
import config from "../config";
import { s3Upload } from "../libs/awsLib";
import { API } from "aws-amplify";

export default class SequenceUploadModal extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      fileChosen: false
    };
  }

  validateForm() {
    return this.state.fileChosen;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleFileChange = event => {
    this.file = event.target.files[0];
    this.setState({ fileChosen: true });
  };

  handleSubmit = async event => {
    event.preventDefault();
    let extension = this.file.name.split(".")[1];
    if (
      (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) ||
      !(extension === "fsa" || extension === "fasta" || extension === "txt")
    ) {
      alert(
        `Please pick a fasta file smaller than ${config.MAX_ATTACHMENT_SIZE /
          1000000} MB.`
      );
      return;
    }
    this.setState({ isLoading: true });
    try {
      const attachment = this.file ? await s3Upload(this.file) : null;

      console.log(`file uploaded: ${attachment}`);
      API.post("align", "/align", {
        body: { sequenceName: this.file.name, sequenceURI: attachment }
      })
        .catch(err => alert(err))
        .then(this.props.alignmentComplete);
      this.setState({ isLoading: false });
      this.props.onHide();
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  };

  render() {
    let { show, onHide } = this.props;
    return (
      <Modal show={show} onHide={onHide}>
        <form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Search Subsequence</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="file">
              <Form.Label>Upload a new fasta file to blast search.</Form.Label>
              <Form.Control onChange={this.handleFileChange} type="file" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Search"
              loadingText="Uploading..."
            />
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
