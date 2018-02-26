# Description
Trackermateo is an app created by Mateo Agudelo Toro which allows its users to record their locations and also see them later on Google Maps.
When they decide to *record*, their position is saved every 1 second. Then, when they want to see their past, they can use the *view* option  and the positions they have recorded will be shown in Google Maps.

# Technologies

This app is built using [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) for the back end, [Angular](https://angular.io/) to create the font end and [MongoDB](https://www.mongodb.com/) for data persistence (hosted at [mLab](https://mlab.com/)). The web server is provided by [NGINX](https://nginx.org/), with [PM2](http://pm2.keymetrics.io/) as process manager for Node.js and [Jenkins](https://jenkins.io/) for continuous integration and delivery.

# Deployment

### Production

The easiest way is using [Heroku](https://trackermateo.herokuapp.com/) and linking this repository to it for automatic deployment. Example: [https://trackermateo.herokuapp.com/](https://trackermateo.herokuapp.com/)

### Testing

Following are the instructions to deploy this application on a CentOS 7 server. It's already deployed on the assigned server at the DCA (10.131.137.189)

1. Git

    Check the installed version of Git using 
    <pre>git --version</pre>

    If Git is not already installed, install it using
    <pre>sudo yum install git</pre>

2. Node 8 LTS

    Check the installed version of Node and NPM (Node Package Manager) using, respectively
    <pre>node -v</pre>
    <pre>npm -v</pre>

    If Node and/or NPM is/are not already installed, install it/them using

    <pre>curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -</pre>
    <pre>sudo yum -y install nodejs</pre>

    Optional: install build tools
    <pre>sudo yum groupinstall 'Development Tools'</pre>

3. If firewall is blocking any of them, open ports 80 (HTTP), 443 (HTTPS) and 8080 (Jenkins)
    <pre>sudo firewall-cmd --permanent --add-port=80/tcp</pre>
    <pre>sudo firewall-cmd --permanent --add-port=443/tcp</pre>
    <pre>sudo firewall-cmd --permanent --add-port=8080/tcp</pre>
    <pre>sudo firewall-cmd --reload</pre>

4. Jenkins

    Check the installed version of Java using 
    <pre>java -version</pre>

    If Java is not already installed, install it using
    <pre>sudo yum -y install java</pre>

    Add Jenkins repo
    <pre>sudo wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat/jenkins.repo</pre>
    <pre>sudo rpm --import https://jenkins-ci.org/redhat/jenkins-ci.org.key</pre>

    Install Jenkins
    <pre>sudo yum install jenkins</pre>

    Start the Jenkins service
    <pre>sudo systemctl start/stop/restart jenkins.service</pre>

    Finish the setup by getting and typing the password, installing the suggested plugins and creating an admin user

    Now its time to setup automatic pulls for each commit pushed to the GitHub repo so it works just like on Heroku

    Open Jenkins interface and log in with the admin user that was just created
    <pre>http://10.131.137.189:8080</pre>

    Go to *Manage Jenkins* --> *Manage plugins* --> *Available*

    Check *GitHub Integration Plugin* and then click on *Download now and install after restart*

    Click on *Restart Jenkins when installation is complete and no jobs are running* and wait until it finishes

    Now create a *New Item* on Jenkins named *trackermateo* as a *Freestyle project*

    In the GitHub project option add the repo's URL: *https://github.com/agudelotmateo/trackermateo*

    In *Source Code Management* type *https://github.com/agudelotmateo/trackermateo.git* in the *Repository URL* field

    Check *GitHub hook trigger for GITScm polling* under *Build Triggers*

    Finally, hit *save*

    Now, go to the repository and add the web hook to the server. **NOTE:** This will NOT work because server's IP is not public.
    As a temporary workaround, I've set Jenkins to pull every one minute by setting as *Schedule* under *Build Triggers* the value
    \* \* \* \* \* (five space separated asterisks).

5. Create a Self Signed Certificate for HTTPS (since the IP is private, this is the only way to get HTTPS to work, which is required to access the user's location through HTML)

    <pre>sudo mkdir /etc/ssl/private</pre>
    <pre>sudo chmod 700 /etc/ssl/private</pre>
    <pre>sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt</pre>
    Fill all the info using 10.131.137.189 as the *Common Name*

6. PM2

    Install PM2 to run the Node.js app as a service
    <pre>sudo npm install pm2@latest -g</pre>

    Run the app on port 3000
    <pre>PORT=3000 pm2 start /var/lib/jenkins/workspace/trackermateo/index.js</pre>

7. NGINX with reverse proxy and HTTPS

    Install NGINX

    <pre>sudo yum install epel-release</pre>
    <pre>sudo yum install nginx</pre>

    Start the service
    <pre>sudo systemctl start nginx</pre>

    Edit the nginx configuration file (*/etc/nginx/nginx.conf*) so it looks like this

    ```
    user root;
    worker_processes auto;
    error_log /var/log/nginx/error.log;
    pid /run/nginx.pid;

    # Load dynamic modules. See /usr/share/nginx/README.dynamic.
    include /usr/share/nginx/modules/*.conf;

    events {
        worker_connections 1024;
    }

    http {
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

        access_log  /var/log/nginx/access.log  main;

        sendfile            on;
        tcp_nopush          on;
        tcp_nodelay         on;
        keepalive_timeout   65;
        types_hash_max_size 2048;

        include             /etc/nginx/mime.types;
        default_type        application/octet-stream;

        # Load modular configuration files from the /etc/nginx/conf.d directory.
        # See http://nginx.org/en/docs/ngx_core_module.html#include
        # for more information.
        include /etc/nginx/conf.d/*.conf;

        server {
            listen       80 default_server;
	        server_name 10.131.137.189;
	        root /var/lib/jenkins/workspace/trackermateo;

            location / {
		        try_files $uri @backend;
            }

	        location @backend {
    		    proxy_pass http://127.0.0.1:3000;
	        }
        }

        # Settings for a TLS enabled server.

        server {
            listen       443 ssl http2 default_server;
            listen       [::]:443 ssl http2 default_server;
            server_name 10.131.137.189;
	        root /var/lib/jenkins/workspace/trackermateo;

            ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
            ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
            ssl_dhparam /etc/ssl/certs/dhparam.pem;

            location / {
		        try_files $uri @backend;
            }

    	    location @backend {
	    	    proxy_pass http://127.0.0.1:3000;
	        }
        }

    }
    ```

    Notice the user, the reverse proxy and the TLS/SSL settings

    Allow the connection
    <pre>setsebool -P httpd_can_network_connect true</pre>

    Restart NGINX
    <pre>sudo systemctl restart nginx</pre>

By now the app will be running and you will be able to access it through *https://\<your-server-ip\>*

# Screenshots

![Tackermateo's Dashboard image couldn't be loaded](https://i.imgur.com/gAnpToL.jpg "Tackermateo's Dashboard")
![Tackermateo's Recording Location image couldn't be loaded](https://i.imgur.com/caQcITz.jpg "Tackermateo's Recording Location")
![Tackermateo's View Locations image couldn't be loaded](https://i.imgur.com/hhq2WZb.jpg "Tackermateo's View Locations")


# API

### Record
Records the current location and adds it to the DB

* **URL**
    `/record/:apiKey`

* **Method**
    `POST`
  
* **Required URL Params**
    * `apiKey=[String]`

* **Data Params**
    `{ latitude: Number, longitude: Number, username: String }`

* **Success Response**
    `{ success: true, msg: "Location successfully recorded" }`
 
* **Error Response**
    * `{ success: false, msg: "Invalid API key" }`
    * `{ success: false, msg: "Failed to record location" }`


### Register
Registers a new user

* **URL**
    `/register/:apiKey`

* **Method**
    `POST`
  
* **Required URL Params**
    * `apiKey=[String]`

* **Data Params**
    `{ name: String, email: String, username: String, password: String }`

* **Success Response**
    `{ success: true, msg: "User successfully registered" }`
 
* **Error Response**
    * `{ success: false, msg: "Invalid API key" }`
    * `{ success: false, msg: "Username already in use" }`
    * `{ success: false, msg: "Email already in use" }`
    * `{ success: false, msg: "Failed to register user" }`


### Authenticate
Validates the login credentials

* **URL**
    `/authenticate/:apiKey`

* **Method**
    `POST`
  
* **Required URL Params**
    * `apiKey=[String]`

* **Data Params**
    `{ username: String, password: String }`

* **Success Response**
    `{ success: true, token: String, user: { id: String, name: String, username: String, email: String } } `
 
* **Error Response**
    * `{ success: false, msg: "Invalid API key" }`
    * `{ success: false, msg: "User not found" }`
    * `{ success: false, msg: "Wrong password" }`


### Profile
Accesses to the user's profile information iff he's logged in

* **URL**
    `/profile/:apiKey`

* **Method**
    `GET`
  
* **Required URL Params**
    * `apiKey=[String]`

* **Success Response**
    `{ user: String } `
 
* **Error Response**
    `{ success: false, msg: "Invalid API key" }`


### Location
Accesses to the user's saved locations iff he's logged in

* **URL**
    `/location/:apiKey/:username`

* **Method**
    `GET`
  
* **Required URL Params**
    * `apiKey=[String]`
    * `username=[String]`

* **Success Response**
    `{ location: Array[ { username: String, latitude: Number, longitude: Number, date: Date } ] } `
 
* **Error Response**
    `{ success: false, msg: "Invalid API key" }`
