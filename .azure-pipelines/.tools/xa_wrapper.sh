#!/usr/bin/env bash

ORIGINAL_COMMAND="$@"
SLS_STAGE_ARG=""
XA_TARGET_ROLE=""
XA_COMMAND=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -s) SLS_STAGE_ARG="$2"; shift 2;;
        --stage=*) SLS_STAGE_ARG="${1#*=}"; shift 1;;
        -r) XA_TARGET_ROLE="$2"; shift 2;;
        --target-role=*) XA_TARGET_ROLE="${1#*=}"; shift 1;;
        *) XA_COMMAND="${XA_COMMAND} $1"; shift 1;;
    esac
done

function  lc() { echo ${*,,} ; }
function  tc() { set ${*,,} ; echo ${*^} ; }
function  trim() { local var="$*"; var="${var#"${var%%[![:space:]]*}"}"; var="${var%"${var##*[![:space:]]}"}"; printf '%s' "$var"; }

function assume_role {
    SLS_CONFIG_ACCOUNT_ID=$(cat $SERVERLESS_CONFIG_JSON | jq -r '.deploy.target.accountId')
    echo "[xa wrapper] using account id:  $SLS_CONFIG_ACCOUNT_ID"
    XA_ROLE_ARN=$(cat $SERVERLESS_CONFIG_JSON | jq -r '.deploy.target.role')
    if [[ ! "${XA_ROLE_ARN}" =~ /arn:aws:iam::/ ]]; then
        case "$(lc ${XA_TARGET_ROLE})" in
        "delivery")
            XA_ROLE_ARN="arn:aws:iam::${SLS_CONFIG_ACCOUNT_ID}:role/crossaccount/provisioning/${CICD_SYSTEM:-AzureDevOps}_$(tc ${DELIVERY_CONTEXT:-sandbox})_Delivery";;
        "testing")
            XA_ROLE_ARN="arn:aws:iam::${SLS_CONFIG_ACCOUNT_ID}:role/crossaccount/testing/${CICD_SYSTEM:-AzureDevOps}_$(tc ${DELIVERY_CONTEXT:-sandbox})_Automation";;
        *)
            XA_ROLE_ARN="arn:aws:iam::${SLS_CONFIG_ACCOUNT_ID}:role/crossaccount/provisioning/${CICD_SYSTEM:-AzureDevOps}_$(tc ${DELIVERY_CONTEXT:-sandbox})_Delivery";;
        esac
        echo "[xa wrapper] using default role arn:  $XA_ROLE_ARN"
    else
        echo "[xa wrapper] using provided role arn:  $XA_ROLE_ARN"
    fi

    XA_ROLE_CREDS=$(aws sts assume-role \
                        --role-arn "${XA_ROLE_ARN}" \
                        --role-session-name "${AWS_ROLESESSIONNAME:-sls_wrapper_session}" \
                        --tags Key=Project,Value="${DEPLOY_CONTEXT:-dev}" Key=Context,Value="${DELIVERY_CONTEXT:-sandbox}" \
                        --transitive-tag-keys Project Context)

    export AWS_ACCESS_KEY_ID=$(echo $XA_ROLE_CREDS | jq -r '.Credentials''.AccessKeyId');\
    export AWS_SECRET_ACCESS_KEY=$(echo $XA_ROLE_CREDS | jq -r '.Credentials''.SecretAccessKey');\
    export AWS_SESSION_TOKEN=$(echo $XA_ROLE_CREDS | jq -r '.Credentials''.SessionToken');
}

function setup {
    SLS_STAGE=""
    if [[ ! -z "${SLS_STAGE_ARG}" ]]; then
        SLS_STAGE=${SLS_STAGE_ARG}
    elif [[ ! -z "${OVERRIDE_SLS_STAGE}" ]]; then
        if [[ "${OVERRIDE_SLS_STAGE}" != "local" ]]; then
            SLS_STAGE=${OVERRIDE_SLS_STAGE}
        fi
    else
        SLS_STAGE=${DELIVERY_STAGE:-sandbox}
    fi

    if [[ ! -z "${SLS_STAGE}" && "${SLS_STAGE}" != "local" ]]; then
        if [[ -z "${SERVERLESS_CONFIG_JSON}" ]]; then
            echo "##vso[task.logissue type=error] The ${SLS_STAGE} stage was provided but no serverless config json.";
            exit 1
        elif [[ ! -f "${SERVERLESS_CONFIG_JSON}" ]]; then
            echo "##vso[task.logissue type=error] The ${SLS_STAGE} was provided but the serverless config file at ${SERVERLESS_CONFIG_JSON} does not exist.";
            exit 1
        fi
        assume_role "${SERVERLESS_CONFIG_JSON}"
    else
      echo "[xa wrapper] no stage provided"
    fi
}

if setup ; then
    set -f ; # disable glob of original command params
    XA_COMMAND="$(trim ${XA_COMMAND})"
    echo "[xa wrapper] executing command: ${XA_COMMAND}"
    exec ${XA_COMMAND}
    set +f
else
    echo "[xa wrapper] set up failed"
    exit 1
fi
