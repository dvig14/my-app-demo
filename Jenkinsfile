def deployApp(branchName, envName, frontendDir, backendDir, backendService) {
    sh """
        echo "Deploying ${branchName} to ${envName}..."

        mc cp $MINIO_ALIAS/$MINIO_BUCKET/frontend/$branchName/$BUILD_ID_TAG/frontend.zip ./frontend-app-${envName}.zip
        mc cp $MINIO_ALIAS/$MINIO_BUCKET/backend/$branchName/$BUILD_ID_TAG/backend.zip ./backend-app-${envName}.zip

        scp frontend-app-${envName}.zip vagrant@192.168.56.11:~/
        scp backend-app-${envName}.zip vagrant@192.168.56.11:~/

        ssh vagrant@192.168.56.11 << EOF
            sudo unzip -o ~/frontend-app-${envName}.zip -d ${frontendDir}
            sudo rm ~/frontend-app-${envName}.zip

            sudo unzip -o ~/backend-app-${envName}.zip -d ${backendDir}
            sudo rm ~/backend-app-${envName}.zip

            cd ${backendDir}
            npm install
            sudo systemctl restart ${backendService}
            sudo systemctl restart nginx
        EOF
    """
}

pipeline {
    agent any

    tools {
        nodejs 'NodeJS_18'
    }

    environment {
        MINIO_ALIAS = "minio-server"
        MINIO_BUCKET = "my-app"
        BRANCH_NAME = "${env.BRANCH_NAME}"
        BUILD_ID_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        AWS_ACCESS_KEY_ID     = credentials('MINIO_ACCESS_KEY')
        AWS_SECRET_ACCESS_KEY = credentials('MINIO_SECRET_KEY')
    }

    stages {
        stage('Checkout App + Infra') {
            steps {
                script {
                    // Checkout main repo
                    checkout scm

                    // Checkout only infra subfolders from Dev-FailOps
                    dir('failops') {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/master']],
                            doGenerateSubmoduleConfigurations: false,
                            userRemoteConfigs: [[
                                url: 'https://github.com/dvig14/Dev-FailOps.git'
                            ]],
                            extensions: [[
                                $class: 'SparseCheckoutPaths',
                                sparseCheckoutPaths: [
                                    [path: 'infra/terraform'],
                                    [path: 'infra/provision'],
                                    [path: 'infra/output']
                                ]
                            ]]
                        ])
                    }
                }
            }
        }

        stage('Install & Test') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            sh 'npm run test:unit'
                        }
                    }
                }
            }
        }

        stage('Build & Zip') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                            sh 'zip -r frontend.zip build'
                        }
                    }
                }
                stage('Backend Zip') {
                    steps {
                        dir('backend') {
                            sh 'zip -r backend.zip . -x "node_modules/*"'
                        }
                    }
                }
            }
        }

        stage('Upload Artifacts to MinIO') {
            steps {
                sh """
                mc cp frontend/frontend.zip $MINIO_ALIAS/$MINIO_BUCKET/frontend/$BRANCH_NAME/$BUILD_ID_TAG/
                mc cp backend/backend.zip  $MINIO_ALIAS/$MINIO_BUCKET/backend/$BRANCH_NAME/$BUILD_ID_TAG/
                """
            }
        }

        stage('Provision Infra') {
            steps {
                dir('failops/infra/terraform/vagrant') {
                    sh """
                      chmod -R +x ./.providers ../../provision
                      terraform init -plugin-dir=./.providers -backend-config="key=terra-infra/terraform.tfstate"
                      terraform apply -var="app_enable=true" -auto-approve=true
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    deployApp('develop', 'staging', '/var/www/my-app-staging', '/opt/my-app-backend-staging', 'my-app-backend-staging')
                }
            }
        }

        stage('Staging Tests') {
            when {
                branch 'develop'
            }
            environment {
               API_BASE_URL = "http://192.168.56.11:3001"   // Backend staging port
               FRONTEND_BASE_URL = "http://192.168.56.11:81"   // Frontend staging URL
            }
            parallel {
                stage('Frontend E2E Test') {
                    steps {
                        dir('tests/frontend') {
                            sh """
                                export BASE_URL=$FRONTEND_BASE_URL
                                npm install
                                npx cypress run --config baseUrl=$BASE_URL
                            """   
                        }
                    }
                }
                stage('Backend API Test') {
                    steps {
                        dir('backend') {
                            sh """
                                export API_BASE_URL=$API_BASE_URL
                                npm install
                                npm run test:staging
                            """
                        }
                    }
                }
            }     
        }

        stage('Manual Approval for Production') {
            when { branch 'master' }
            steps {
                input "Approve Deployment to Production?"
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                script {
                    deployApp('master', 'prod', '/var/www/my-app-prod', '/opt/my-app-backend-prod', 'my-app-backend-prod')
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully for ${BRANCH_NAME}"
        }
        failure {
            echo "❌ Pipeline failed for ${BRANCH_NAME}"
        }
    }
}
