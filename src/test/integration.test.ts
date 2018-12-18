import test from 'ava'
import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLServer as YogaServer } from 'graphql-yoga'
import { gql, ApolloServer } from 'apollo-server'
import * as request from 'request-promise-native'
import { AddressInfo } from 'ws'
import { applyMiddleware, middleware, IMiddleware } from '../'

test('Works with GraphQL Yoga', async t => {
  const typeDefs = `
    type Query {
      test: String!
    }
  `

  const resolvers = {
    Query: {
      test: () => 'test',
    },
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const schemaWithMiddleware = applyMiddleware(schema, async resolve => {
    const res = await resolve()
    return `pass-${res}`
  })

  const server = new YogaServer({
    schema: schemaWithMiddleware,
  })

  const http = await server.start({ port: 0 })
  const { port } = http.address() as AddressInfo
  const uri = `http://localhost:${port}/`

  /* Tests */

  const query = `
    query {
      test
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      test: 'pass-test',
    },
  })
})

test('Works with ApolloServer', async t => {
  const typeDefs = `
    type Query {
      test: String!
    }
  `

  const resolvers = {
    Query: {
      test: () => 'test',
    },
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const schemaWithMiddleware = applyMiddleware(schema, async resolve => {
    const res = await resolve()
    return `pass-${res}`
  })

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
  })

  await server.listen({ port: 8008 })
  const uri = `http://localhost:8008/`

  /* Tests */

  const query = `
    query {
      test
    }
  `

  const body = await request({
    uri,
    method: 'POST',
    json: true,
    body: { query },
  }).promise()

  t.deepEqual(body, {
    data: {
      test: 'pass-test',
    },
  })
})
