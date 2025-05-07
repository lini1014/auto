#!groovy

/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// https://www.jenkins.io/doc/tutorials/create-a-pipeline-in-blue-ocean

pipeline {
    agent {
        docker {
            image 'node:23.11.0-bookworm-slim' // Verwende die korrekte Node.js-Version basierend auf deinem Dockerfile
            volumes '/var/jenkins_home/workspace/auto:/var/jenkins_home/workspace/auto:rw,z'
            // args '--publish 3000:3000 --publish 5000:5000' // Nur notwendig, wenn du Ports explizit mappen musst
            // args '--user root:root' // Nicht notwendig, da der User im Docker-Image (node) verwendet wird
        }
    }

    options {
        // Timeout fuer den gesamten Job
        timeout time: 60, unit: 'MINUTES'
    }

    stages {
        // Stage = Logisch-zusammengehoerige Aufgaben der Pipeline:
        // zur spaeteren Visualisierung
        stage('Init') {
            // Step = einzelne Aufgabe
            steps {
                script {
                    if (!isUnix()) {
                        error 'Unix ist erforderlich'
                    }
                }

                echo "Jenkins-Job ${env.JOB_NAME} #${env.BUILD_ID} mit Workspace ${env.WORKSPACE}"

                // Unterverzeichnisse src und test im WORKSPACE loeschen: vom letzten Build
                // Kurzform fuer: sh([script: '...'])
                sh 'rm -rf src __tests__ node_modules dist .extras/doc/api .extras/doc/folien/folien.html .extras/doc/projekthandbuch/html'

                // https://www.jenkins.io/doc/pipeline/steps/git
                // "named arguments" statt Funktionsaufruf mit Klammern
                git url: 'https://github.com/lini1014/auto', branch: 'main', poll: true
            }
        }

        stage('Install') {
            steps {
                sh 'id'
                sh 'cat /etc/passwd'
                sh 'echo $PATH'
                sh 'pwd'
                sh 'uname -a'
                sh 'cat /etc/os-release'
                sh 'cat /etc/debian_version'

                sh 'apt-cache policy nodejs'
                sh 'apt-get update --yes'
                sh 'apt-get upgrade --yes'
                sh 'python3 --version' // Überprüfe, ob Python jetzt gefunden wird

                sh 'node --version'
                sh 'npm i -g npm'
                sh 'npm --version'

                script {
                    if (!fileExists("${env.WORKSPACE}/package.json")) {
                        error "package.json ist *NICHT* in ${env.WORKSPACE} vorhanden"
                    }
                }

                sh 'cat package.json'
                sh 'npm ci --no-fund --no-audit'
            }
        }

        stage('Compile') {
            steps {
                sh './node_modules/.bin/tsc --version' // Verwende den lokalen tsc
                sh './node_modules/.bin/tsc'
            }
        }

        stage('Test, Codeanalyse, Security, Dok.') {
            steps {
                parallel(
                    'Test': {
                        echo 'TODO: Rechnername/IP-Adresse des DB-Servers fuer Tests konfigurieren'
                        //sh 'npm run test:coverage'
                    },
                    'ESLint': {
                        sh './node_modules/.bin/eslint --version'
                        sh 'npm run eslint'
                    },
                    'Security Audit': {
                        echo 'TODO: "npm audit" schlaegt fehl: @nestjs/graphql -> subscriptions-transport-ws -> ws'
                        //sh 'npm audit --omit=dev'
                    },
                    'AsciiDoctor': {
                        sh './node_modules/.bin/asciidoctor --version'
                        sh 'npm run asciidoctor'
                    },
                    'reveal.js': {
                        sh './node_modules/.bin/asciidoctor-revealjs --version'
                        sh 'npm run revealjs'
                    },
                    'TypeDoc': {
                        sh './node_modules/.bin/typedoc --version'
                        sh 'npm run typedoc'
                    }
                )
            }

            post {
                always {
                    echo 'TODO: Links fuer Coverage und TypeDoc'
                    //publishHTML target : [
                    //  reportDir: 'coverage',
                    //  reportFiles: 'index.html',
                    //  reportName: 'Coverage (Istanbul)',
                    //  reportTitles: 'Coverage'
                    //]

                    publishHTML (target : [
                        reportDir: '.extras/doc/projekthandbuch/html',
                        reportFiles: 'projekthandbuch.html',
                        reportName: 'Projekthandbuch',
                        reportTitles: 'Projekthandbuch'
                    ])

                    publishHTML target : [
                        reportDir: '.extras/doc/folien',
                        reportFiles: 'folien.html',
                        reportName: 'Folien (reveal.js)',
                        reportTitles: 'reveal.js'
                    ]

                    publishHTML target : [
                        reportDir: '.extras/doc/api',
                        reportFiles: 'index.html',
                        reportName: 'TypeDoc',
                        reportTitles: 'TypeDoc'
                    ]
                }

                success {
                    script {
                        if (fileExists("${env.WORKSPACE}/auto.zip")) {
                            sh 'rm auto.zip'
                        }
                    }
                    // https://www.jenkins.io/doc/pipeline/steps/pipeline-utility-steps/#zip-create-zip-file
                    zip zipFile: 'auto.zip', archive: false, dir: 'dist'
                    // jobs/auto/builds/.../archive/auto.zip
                    archiveArtifacts 'auto.zip'
                }
            }
        }

        stage('Docker Image bauen') {
            steps {
                echo 'TODO: Docker-Image bauen'
                // https://www.jenkins.io/doc/book/pipeline/docker/#building-containers
                // def image = docker.build("juergenzimmermann/auto:${env.BUILD_ID}")
                // image.push()
                // image.push('latest')
            }
        }

        stage('Deployment fuer Kubernetes') {
            steps {
                echo 'TODO: Deployment fuer Kubernetes mit z.B. Ansible, Terraform'
            }
        }
    }
}