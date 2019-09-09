let apiHost;
if (process.env.NODE_ENV === "development" && false) {
  apiHost = "http://localhost:4000";
} else {
  apiHost = "https://4w5yfp46hb.execute-api.us-east-2.amazonaws.com/prod";
}

export default {
  s3: {
    REGION: "us-east-2",
    BUCKET: "ginkgo-files"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: apiHost
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_YU0qz3GrT",
    APP_CLIENT_ID: "2og9t3bog5e3aaaalu7mi0hbta",
    IDENTITY_POOL_ID: "us-east-2:a228cf74-2e00-4c49-97c0-b79dd647be1c"
  },
  MAX_ATTACHMENT_SIZE: 10000000
};
