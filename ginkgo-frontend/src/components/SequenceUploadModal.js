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
      isLoading: null
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleFileChange = event => {
    this.file = event.target.files[0];
  };

  handleSubmit = async event => {
    let eValue = event.currentTarget.eValue.value;
    event.preventDefault();
    event.stopPropagation();
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
      API.post("align", "/align", {
        body: {
          sequenceName: this.file.name,
          sequenceURI: attachment,
          eValue: eValue
        }
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
        <Modal.Header closeButton>
          <Modal.Title>Search Subsequence</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group controlId="file">
              <Form.Label>Upload a new fasta file to blast search.</Form.Label>
              <Form.Control
                onChange={this.handleFileChange}
                type="file"
                required
              />
            </Form.Group>
            <Form.Group controlId="eValue">
              <Form.Label>EValue:</Form.Label>
              <Form.Control type="number" required />
            </Form.Group>
            <LoaderButton
              block
              type="submit"
              isLoading={this.state.isLoading}
              text="Search"
              loadingText="Uploading..."
            />
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}
