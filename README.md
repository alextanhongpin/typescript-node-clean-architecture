# clean-typescript

A better architecture for microservice.

## Init

```bash
$ tsc --init

npm init   # and follow the resulting prompts to set up the project
npm i koa koa-router koa-body
npm i --save-dev typescript ts-node nodemon
npm i --save-dev @types/koa @types/koa-router
```

## Structure

In order to avoid `shotgun surgery`, whereby making changes will make us change implementations in different places of the codebase, it is preferable to group similar behaviours close to one another.

```js
function endpointBuilder({parseRequest, statusCode, service, parseResponse, middlewares}) {
    return function endpoint(req, res) {
        try {
            const ctx = {
                ...res.locals
            }
            let request = parseRequest({ 
                body: req.body,
                params: req.params,
                query: req.query
            })
            for (let middleware of middlewares) {
                request = middleware(request)
            }
            const response = await service(ctx, request)
            res.status(statusCode()).json(parseResponse ? parseResponse(response) : response)
        } catch (error) {
            return res.status(400).json({
                error: error.message
            })
        }
    }
}

function parseRequest ({ body }) {
  return {
    a: body.a,
    b: body.b
  }
}

function parseResponse (response) {
  return {
    sum: response
  }
}

// What if service requires a dependency (database, logger etc)?
function buildSumService(repo) {
  async function sumService ({a, b}) {
    const response = a + b
    await repo.save(response)
    return response
  }
}

function validate(request) {
  const { a, b } = request
  if (!isDefined(a)) {
    throw new Error('a is required')
  }
  if (!isDefined(b)) {
    throw new Error('b is required')
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('invalid number')
  }
  return request
}

function isDefined (a) {
  return a !== null && a !== undefined
}

const getSumEndpointBuilder = function build (repo) {
  return endpointBuilder({
      parseRequest,
      statusCode:() => 200,
      service: sumService(repo),
      parseResponse,
      middlewares: [ validate ]
  })
}

module.exports = getSumEndpointBuilder
```
