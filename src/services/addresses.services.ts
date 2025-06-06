import { ObjectId } from 'mongodb'

import Address, { Province } from '~/models/databases/Address'
import { CreateAddressReqBody } from '~/models/requests/addresses.requests'
import databaseService from '~/services/database.services'

class AddressesService {
  async getProvinces() {
    const [provinces, totalProvinces] = await Promise.all([
      databaseService.provinces
        .find(
          {},
          {
            projection: {
              code: 1,
              name: 1
            },
            sort: {
              name: 1
            }
          }
        )
        .toArray(),
      databaseService.provinces.countDocuments({})
    ])
    return {
      provinces,
      totalProvinces
    }
  }

  async getDistricts(provinceId: ObjectId) {
    const province = await databaseService.provinces.findOne({
      _id: provinceId
    })
    const districts = (province as Province).districts
    const _districts = districts.map((district) => ({
      id: district.id,
      name: district.name
    }))
    return {
      districts: _districts,
      totalDistricts: districts.length
    }
  }

  async getWards({ provinceId, districtId }: { provinceId: ObjectId; districtId: string }) {
    const province = await databaseService.provinces.findOne({
      _id: provinceId
    })
    const districts = (province as Province).districts
    const district = districts.find((district) => district.id === districtId)
    const wards = district?.wards ?? []
    return {
      wards,
      totalWards: wards.length
    }
  }

  async createAddress({ body, userId }: { body: CreateAddressReqBody; userId: ObjectId }) {
    const { insertedId } = await databaseService.addresses.insertOne(
      new Address({
        ...body,
        provinceId: new ObjectId(body.provinceId),
        userId
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

  async getAddresses(userId: ObjectId) {
    const addresses = await databaseService.addresses
      .aggregate([
        {
          $match: {
            userId
          }
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
          $addFields: {
            district: {
              $filter: {
                input: '$province.districts',
                as: 'district',
                cond: {
                  $eq: ['$$district.id', '$districtId']
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: '$district'
          }
        },
        {
          $addFields: {
            ward: {
              $filter: {
                input: '$district.wards',
                as: 'ward',
                cond: {
                  $eq: ['$$ward.id', '$wardId']
                }
              }
            }
          }
        },
        {
          $unwind: {
            path: '$ward'
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
            district: {
              $first: '$district'
            },
            ward: {
              $first: '$ward'
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
            'province.id': 0,
            'province.districts': 0,
            'district.wards': 0,
            'district.streets': 0,
            'district.projects': 0
          }
        },
        {
          $sort: {
            updatedAt: -1
          }
        }
      ])
      .toArray()
    return {
      addresses
    }
  }
}

const addressesService = new AddressesService()
export default addressesService
