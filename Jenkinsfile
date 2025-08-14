pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Automatically checks out the branch that triggered this job
                checkout scm
            }
        }

        stage('Build') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        echo 'Building Frontend...'
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }

                stage('Backend Build') {
                    steps {
                        echo 'Building Backend...'
                        dir('backend') {
                            sh 'npm install'
                            sh 'zip -r backend.zip.'
                        }
                    }
                }
            }
        }
    }
        
}
