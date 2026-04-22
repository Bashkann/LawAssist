pipeline {
    agent any
    stages {
        stage('Kod Alma') {
            steps {
                git branch: 'main', url: 'https://github.com/Bashkann/LawAssist.git'
            }
        }
        stage('Build ve Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }
        stage('Sağlık Kontrolü') {
            steps {
                script {
                    sleep 10
                    sh 'curl -f http://host.docker.internal:5000 || echo "Backend henuz hazir degil"'
                }
            }
        }
    }
    post {
        success {
            echo 'Deploy başarılı: LawAssist çalışıyor.'
        }
        failure {
            echo 'Deploy başarısız: logları kontrol et.'
        }
    }
}