import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';

const s3 = new AWS.S3();
const sns = new AWS.SNS();

/**
 *
 * @param event APIGatewayProxyEvent
 * @returns Promise<APIGatewayProxyResult>
 */
export const fileHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '');
        const fileContent = body.fileContent;
        const fileName = body.fileName;
        const bucketName = process.env.FILES_BUCKET_NAME ?? '';
        const key = `uploads/${fileName}`;

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

/**
 * 
 * @param event SQSEvent
 * @returns Promise<APIGatewayProxyResult>
 */
export const fileParser = async (event: SQSEvent) : Promise<APIGatewayProxyResult> => {
    try {
        for (const record of event.Records) {
            const sqsMessageBody = JSON.parse(record.body);
    
            // Assuming the S3 event message structure is similar to AWS S3 event notifications
            const s3BucketName = sqsMessageBody.Records[0].s3.bucket.name;
            const s3ObjectKey = sqsMessageBody.Records[0].s3.object.key;
    
            const bucketName = s3BucketName;
            const objectKey = s3ObjectKey;

            const s3Params = {
                Bucket: bucketName,
                Key: objectKey
            };
            const s3Response = await s3.getObject(s3Params).promise();
            const fileContent = s3Response.Body?.toString();

            // Process the file content as needed

            const snsParams = {
                Message: 'File has been processed',
                Subject: 'File has been processed',
                TopicArn: process.env.SNS_TOPIC_ARN
            };
            await sns.publish(snsParams).promise();
        }
        
        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Error' };
    }
};
