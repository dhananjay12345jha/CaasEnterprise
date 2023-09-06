const resources = {
  Resources: {
    EventRuleTransactToInsightBus: {
      Type: "AWS::Events::Rule",
      Properties: {
        EventBusName: "emc-transact-bus",
        EventPattern: {
          "detail-type": ["order.created"],
        },
        Name: "${self:custom.insightRuleName}",
        State: "ENABLED",
        Targets: [
          {
            Arn: "${self:custom.emc.service.insightbus.arn}",
            Id: "insightBusTarget",
            RoleArn: { "Fn::GetAtt": ["InsightIamRole", "Arn"] },
          },
        ],
      },
    },
    InsightIamRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: "${self:custom.insightRuleName}-role",
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: ["events.amazonaws.com"],
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
        Policies: [
          {
            PolicyName: "PutEventsToInsightBus",
            PolicyDocument: {
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Action: ["events:PutEvents"],
                  Resource: "${self:custom.emc.service.insightbus.arn}",
                },
              ],
            },
          },
        ],
      },
    },
  },
};

export default resources;
