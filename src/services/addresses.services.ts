import { ObjectId } from 'mongodb'

import { Province } from '~/models/databases/Address'
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
}

const addressesService = new AddressesService()
export default addressesService
