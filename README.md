# Dashboard.js

A dashboard framework written using Node.js and Redis for data storage.

### Why does this exist?

This was written to display real-time company metrics using portable hardware and a couple large plasma displays. We originally tried using [Dashing](https://github.com/Shopify/dashing), which is nice for displaying many simple data points on one page, but we wanted to display complicated data on many pages. Another major difference is that Dashing uses Ruby, Sinatra and Batman.js (and Coffeescript), whereas Dashboard.js uses Node, Express, and a custom JavaScript framework (and no Coffeescript).

### OS X Installation

If you haven't installed [Homebrew](http://brew.sh) already, do that:

```sh
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

If you haven't installed [Node.js](http://nodejs.org/), [Redis](http://redis.io/), and [Grunt](http://gruntjs.com/) already, do that:

```sh
brew install node redis
npm -g install grunt-cli
```

Install Dashboard.js:

```sh
git clone git@github.com:intentmedia/dashboard.js.git
cd dashboard.js
# Install node dependencies
npm install
# Create the services directory and copy over
# the example services to get started:
cp -R app/example_services app/services
```

### Starting the Application

In terminal window #1, start Redis, if it isn't already running:

```sh
redis-server
```

In terminal window #2, run Grunt and start the Node app:

```sh
grunt
node app/server/app.js
```

### Service Design

Dashboard.js services are fully encapsulated. This means server-side code, client-side code, templates, CSS, and static assets all live in the same directory. The only required file is `client.js`, but most dashboards will also require a `server.js` file.

```
app/
  services/
    service_id/
      public/            # static assets, available at
                         # /services/[service_id]/blah.jpg
      client.js          # all client-side service code
      server.js          # all server-side service code
      [foo].css          # bundled and loaded after the framework CSS
      [template_id].html # hogan template, available to any service
```

A service involves both client-side and server-side polling. The server is continually updating its data, and the client is continually asking the server for the most recent copy.

The easiest way to understand how a service works is by looking at the example services included. There are a number of examples included that demonstrate the basic concepts and what's possible out of the box.

### Project Status

This is beta software, use at your own risk. If you have any issues or feature requests, we would love to know, please open a GitHub issue. Contributions and pull requests are also very welcome - we would especially like to include more out-of-the-box example services.

### Author

Dashboard.js was created by [Andrew Childs](https://github.com/andrewchilds).
