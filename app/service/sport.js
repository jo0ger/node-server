/**
 * @desc 咕咚 运动记录 相关
 */

const ProxyService = require('./proxy')

module.exports = class SportService extends ProxyService {
    get model () {
        return this.app.model.Sport
    }

    mapDataToModel (data) {
        const model = {}
        if (!data) return model
        model.createdAt = data.start_time
        model.updatedAt = data.end_time
        model.autoId = data.auto_id
        model.routeId = data.route_id
        model.location = data.location
        model.type = data.sports_type
        model.index = data.index
        model.uploadedAt = data.upload_time
        model.distance = data.total_length
        model.time = {
            total: data.total_time,
            totalText: data.time_format
        }
        model.elevation = {
            total: data.total_elevation,
            max: data.max_elevation
        }
        model.position = {
            start: {
                lng: data.start_point[0],
                lat: data.start_point[1]
            },
            end: {
                lng: data.end_point[0],
                lat: data.end_point[1]
            },
            offset: {
                lng: data.offsets[0],
                lat: data.offsets[1]
            }
        }
        model.speed = {
            max: data.max_speed,
            avg: data.avg_speed,
            maxPace: data.highest_speed_perkm
        }
        model.perkm = (data.usettime_per_km || []).map(p => {
            return {
                location: {
                    lng: p.atLocation.longitude,
                    lat: p.atLocation.latitude
                },
                paces: p.avg_paces,
                speed: p.avg_speed,
                duration: p.useTime,
                durationText: p.cost_time,
                distance: p.distance,
                totalUseTime: p.totalUseTime,
                totalUseTimeText: p.total_time
            }
        })
        const { route_line, speed_list } = data
        model.points = (data.points || []).map((p, i) => {
            const [lng, lat] = route_line[i] || [0, 0]
            return {
                distance: p.distance,
                elevation: p.elevation,
                speed: speed_list[i] || 0,
                location: { lng, lat },
                hAccuracy: p.hAccuracy,
                vAccuracy: p.vAccuracy,
                timestamp: p.time_stamp,
                topreviouscostTime: p.topreviouscostTime,
                topreviousenergy: p.topreviousenergy,
                topreviousspeed: p.topreviousspeed,
                tostartcostTime: p.tostartcostTime,
                tostartdistance: p.tostartdistance,
                type: p.type
            }
        })
        model.steps = data.total_steps
        model.calories = data.total_calories
        model.fraud = data.is_fraud
        model.user = {
            nick: data.user.nick,
            avatar: data.user.icon_small
        }
        return model
    }

    async fetchRemoteList () {
        // TODO
    }

    async storeRecords (records = []) {
        // const payload = records.map(this.mapDataToModel)
        const data = await this.service.sport.insertMany(records)
        return data
    }
}
