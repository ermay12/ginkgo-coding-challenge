import React from "react";
import { Table } from "react-bootstrap";
import LoaderButton from "./LoaderButton";
import { s3Download } from "../libs/awsLib";

function fileOpener(fileLocation) {
  return () =>
    s3Download(fileLocation).then(r => {
      console.log(r);
      window.open(r, "_blank");
    });
}

export default ({ tableRows }) => (
  <Table bordered hover>
    <thead>
      <tr>
        <th>Date Uploaded</th>
        <th>Sequence File</th>
        <th>Alignment File</th>
      </tr>
    </thead>
    <tbody>
      {tableRows.map(tableRow => (
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
              isLoading={tableRow.outputURI === "computing"}
              text="View"
              loadingText="Processing..."
              onClick={fileOpener(tableRow.outputURI)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
