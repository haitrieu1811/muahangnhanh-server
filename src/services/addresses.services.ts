import { ObjectId } from 'mongodb'

import Address from '~/models/databases/Address'
import { CreateAddressReqBody } from '~/models/requests/addresses.requests'
import databaseService from '~/services/database.services'

class AddressesService {
  async getProvinces() {
    const [provinces, totalProvinces] = await Promise.all([
      databaseService.provinces
        .find(
          {},
          {
            sort: {
              name: 1
            }
          }
        )
        .toArray(),
      databaseService.provinces.countDocuments()
    ])
    return {
      totalProvinces,
      provinces
    }
  }

  async getCommunes(provinceId: ObjectId) {
    const match = { provinceId }
    const [communes, totalCommunes] = await Promise.all([
      databaseService.communes.find(match).toArray(),
      databaseService.communes.countDocuments(match)
    ])
    return {
      totalCommunes,
      communes
    }
  }

  async createAddress({ body, userId }: { body: CreateAddressReqBody; userId: ObjectId }) {
    const totalAddresses = await databaseService.addresses.countDocuments({ userId })
    const { insertedId } = await databaseService.addresses.insertOne(
      new Address({
        ...body,
        provinceId: new ObjectId(body.provinceId),
        communeId: new ObjectId(body.communeId),
        userId,
        isDefault: totalAddresses === 0 ? true : false
      })
    )
    const [address] = await Promise.all([
      databaseService.addresses.findOne({
        _id: insertedId
      }),
      databaseService.users.updateOne(
        {
          _id: userId
        },
        {
          $push: {
            addresses: insertedId
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
    ])
    return {
      address
    }
  }

  async aggregateAddress(match: object = {}) {
    const [addresses, totalAddresses] = await Promise.all([
      databaseService.addresses
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'provinces',
              localField: 'provinceId',
              foreignField: '_id',
              as: 'province'
            }
          },
          {
            $unwind: {
              path: '$province'
            }
          },
          {
            $lookup: {
              from: 'communes',
              localField: 'communeId',
              foreignField: '_id',
              as: 'commune'
            }
          },
          {
            $unwind: {
              path: '$commune'
            }
          },
          {
            $group: {
              _id: '$_id',
              fullName: {
                $first: '$fullName'
              },
              phoneNumber: {
                $first: '$phoneNumber'
              },
              province: {
                $first: '$province'
              },
              commune: {
                $first: '$commune'
              },
              detail: {
                $first: '$detail'
              },
              type: {
                $first: '$type'
              },
              isDefault: {
                $first: '$isDefault'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              }
            }
          },
          {
            $project: {
              'commune.provinceId': 0
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          }
        ])
        .toArray(),
      databaseService.addresses.countDocuments(match)
    ])
    return {
      totalAddresses,
      addresses
    }
  }

  async getAddresses(userId: ObjectId) {
    const result = await this.aggregateAddress({ userId })
    return result
  }

  async updateAddress({ body, addressId }: { body: CreateAddressReqBody; addressId: ObjectId }) {
    await databaseService.addresses.updateOne(
      {
        _id: addressId
      },
      {
        $set: {
          ...body,
          provinceId: new ObjectId(body.provinceId),
          communeId: new ObjectId(body.communeId)
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    const address = await this.aggregateAddress({
      _id: addressId
    })
    return {
      address
    }
  }

  async deleteAddress(addressId: ObjectId) {
    await databaseService.addresses.deleteOne({
      _id: addressId
    })
    return true
  }

  async setDefaultAddress({ addressId, userId }: { addressId: ObjectId; userId: ObjectId }) {
    await databaseService.addresses.updateMany(
      {
        userId
      },
      {
        $set: {
          isDefault: false
        }
      }
    )
    await databaseService.addresses.updateOne(
      {
        _id: addressId
      },
      {
        $set: {
          isDefault: true
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return true
  }
}

const addressesService = new AddressesService()
export default addressesService
