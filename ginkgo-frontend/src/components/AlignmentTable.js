import React, { useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import LoaderButton from "./LoaderButton";
import { s3Download } from "../libs/awsLib";

function fileOpener(fileLocation) {
  return () =>
    s3Download(fileLocation).then(r => {
      console.log(r);
      window.open(r, "_blank");
    });
}

export default ({ tableRows }) => {
  const [show, setShow] = useState(false);
  const [row, setRow] = useState(-1);

  const handleClose = () => {
    setShow(false);
    setRow(-1);
  };

  const handleShow = row => {
    setShow(true);
    setRow(row);
  };

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Date Uploaded</th>
          <th>Sequence File</th>
          <th>Results</th>
          <th>Alignment File</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map((tableRow, index) => (
          <tr key={tableRow.sequenceURI}>
            <td>
              {(unix_timestamp => {
                var date = new Date(unix_timestamp);
                return date.toLocaleDateString("en-US");
              })(tableRow.createdAt)}
            </td>
            <td>
              <div
                className="fake-link"
                onClick={fileOpener(tableRow.sequenceURI)}
              >
                {tableRow.sequenceName}
              </div>
            </td>
            <td>
              <LoaderButton
                isLoading={tableRow.status === "computing"}
                text={tableRow.status === "failure" ? "error" : "View"}
                loadingText="Processing..."
                onClick={() => handleShow(index)}
                disabled={tableRow.status === "failure" || !tableRow.output}
              />
              <Modal
                show={show && index === row}
                onHide={handleClose}
                size="xl"
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    Results for file: {tableRow.sequenceName}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th colSpan={2}>Input Sequence</th>
                        <th colSpan={7}>Output Alignment</th>
                      </tr>
                      <tr>
                        <th>Id</th>
                        <th>Length</th>
                        <th>Id</th>
                        <th>E Value</th>
                        <th>Alignment Length</th>
                        <th>Query Start</th>
                        <th>Query End</th>
                        <th>Subject Start</th>
                        <th>Subject End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRow.output.inputSequences.map(
                        (inputSequence, i) => (
                          <tr key={i}>
                            <td>{inputSequence.id}</td>
                            <td>{inputSequence.length}</td>
                            <td>
                              {tableRow.output.outputAlignments[i].hit_id}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].expect}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].align_length}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].query_start}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].query_end}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].sbjct_start}
                            </td>
                            <td>
                              {tableRow.output.outputAlignments[i].sbjct_end}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </Table>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </td>
            <td>
              <LoaderButton
                isLoading={tableRow.status === "computing"}
                text={tableRow.status === "failure" ? "error" : "View"}
                loadingText="Processing..."
                onClick={fileOpener(tableRow.output.outputURI)}
                disabled={tableRow.status === "failure" || !tableRow.output}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
