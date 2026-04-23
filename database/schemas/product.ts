import { ObjectId } from 'mongodb'

export interface Product {
  _id?: ObjectId
  id: number
  name: string
  image: string
  description: string
  shortDescription: string
  price: number
  createdAt?: Date
  updatedAt?: Date
}

export const productSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name', 'image', 'description', 'shortDescription', 'price'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        id: {
          bsonType: 'int',
          description: 'must be an integer and is required',
        },
        name: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        image: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        description: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        shortDescription: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        price: {
          bsonType: 'int',
          description: 'must be an integer and is required',
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
      },
    },
  },
}
