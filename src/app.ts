import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';

const s3 = new AWS.S3();
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {APIGatewayProxyResult} object - API Gateway Lambda Proxy Output Format
 *
 */
export const fileHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log("-------------")
        const body = JSON.parse(event.body || '');
        const fileContent = body.fileContent;
        const fileName = body.fileName;
        console.log(process.env, "----------------------------");
        // Define S3 bucket and key
        const bucketName = process.env.FILES_BUCKET_NAME ?? '';
        const key = `uploads/${fileName}`;
    
        // Upload file to S3
        const params = {
          Bucket: bucketName,
          Key: key,
          Body: fileContent,
          ContentType: 'application/octet-stream'
        };
    
        await s3.upload(params).promise();
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'File uploaded successfully' })
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};

export const handler = async (event: SQSEvent) : Promise<APIGatewayProxyResult> => {
    try {
        console.log("---------------------")
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
