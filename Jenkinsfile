pipeline {

    agent any

    environment {
        DOCKERHUB_USER = 'aquiladavid'
        IMAGE_NAME = 'eduatlas-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"

        CONTAINER_NAME = 'eduatlas-frontend-test'
        DOCKER_NETWORK = 'eduatlas-network'
    }

    stages {

        stage('Cleanup') {
            steps {
                echo '========== Cleanup =========='

                sh '''
                    docker rm -f ${CONTAINER_NAME} >/dev/null 2>&1 || true
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========== Build =========='

                sh '''
                    docker build \
                    -f dockerfile.prod \
                    -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} \
                    -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest \
                    .
                '''
            }
        }

        stage('Test') {
            steps {
                echo '========== Test =========='

                sh '''
                    docker image inspect ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Run') {
            steps {
                echo '========== Run =========='

                sh '''
                    docker run -d \
                    --name ${CONTAINER_NAME} \
                    --network ${DOCKER_NETWORK} \
                    ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                '''

                sh 'sleep 10'
            }
        }

        stage('Smoke Test') {
            steps {
                echo '========== Smoke Test =========='

                sh '''
                    curl --fail http://${CONTAINER_NAME}
                '''
            }
        }

        stage('Deploy no DockerHub') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin

                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}

                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest

                        docker logout
                    '''
                }
            }
        }
    }

    post {

        always {

            sh '''
                docker rm -f ${CONTAINER_NAME} >/dev/null 2>&1 || true
            '''
        }

        success {
            echo 'Pipeline executada com sucesso!'
        }

        failure {
            echo 'Pipeline falhou!'
        }
    }
}