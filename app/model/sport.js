/**
 * @desc 运动记录模型
 */

const PositionSchema = () => ({
    // 经度
    lng: { type: Number, default: 0 },
    // 纬度
    lat: { type: Number, default: 0 }
})

const StringSchema = (def = '') => ({ type: String, default: def })
const NumberSchema = (def = 0) => ({ type: Number, default: def })

module.exports = app => {
    const { mongoose } = app
    const { Schema } = mongoose

    const SportSchema = new Schema({
        // 自动生成的 ID
        autoId: StringSchema(),

        // 路线 ID
        routeId: StringSchema(),

        // 运动位置
        location: StringSchema(),

        // sports_type 运动类型 0 健走 | 1 跑步 | 2 骑行
        type: NumberSchema(),

        // 状态
        state: NumberSchema(1),

        // 第几次运动
        index: NumberSchema(1),

        // 上传时间
        uploadedAt: { type: Date, default: Date.now },

        // 上传来源
        uploadFrom: StringSchema(),

        // 运动距离 单位：米
        distance: NumberSchema(),

        // 时间信息
        time: {
            // 运动时长 单位：秒
            total: NumberSchema(),
            // 运动时长格式化文本
            totalText: StringSchema()
        },

        // 海拔信息
        elevation: {
            // 海拔总变化 单位：米
            total: NumberSchema(),
            // 最高海拔 单位：米
            max: NumberSchema()
        },

        // 位置信息
        position: {
            // 开始位置
            start: PositionSchema(),
            // 结束位置
            end: PositionSchema(),
            // 偏移量
            offset: PositionSchema()
        },

        // 速度信息
        speed: {
            // 最大速度 单位：公里/时
            max: NumberSchema(),
            // 平均速度 单位：公里/时
            avg: NumberSchema(),
            // 最高配速 单位：秒
            maxPace: NumberSchema()
        },

        perkm: [{
            // 位置信息
            location: PositionSchema(),
            // 配速
            paces: StringSchema(),
            // 速度
            speed: NumberSchema(),
            // 用时 单位: ms
            duration: NumberSchema(),
            // 用时文本
            durationText: StringSchema(),
            // 总距离 单位: km
            distance: NumberSchema(),
            // 总时长 单位: ms
            totalUseTime: NumberSchema(),
            // 总时长文本
            totalUseTimeText: StringSchema()
        }],

        // 运动记录点信息
        points: [{
            distance: NumberSchema(),
            elevation: NumberSchema(),
            speed: NumberSchema(),
            location: PositionSchema(),
            hAccuracy: NumberSchema(),
            vAccuracy: NumberSchema(),
            timestamp: StringSchema(),
            topreviouscostTime: NumberSchema(),
            topreviousenergy: NumberSchema(),
            topreviousspeed: NumberSchema(),
            tostartcostTime: NumberSchema(),
            tostartdistance: NumberSchema(),
            type: StringSchema()
        }],

        // 总步数
        steps: NumberSchema(),

        // 总卡路里 单位：大卡
        calories: NumberSchema(),

        // 是否是有效记录 0 有效 | 1 无效？待定
        fraud: NumberSchema(),

        // 用户
        user: {
            nick: StringSchema(),
            avatar: StringSchema()
        },

        // 字段保留
        // followed,
        // status_code,
        // offset_text,
        // goal_value,
        // running_score,
        // user_id,
        // state,
        // version,
        // activity_result,
        // custom_words,
        // data_body,
        // times,
        // relate_group,
        // route_images,
        // map_type,
        // product_type,
        // product_id,
        // IsOpen,
        // goal_type,
        // route_image,
        // points,
        // activity_type
    })

    return mongoose.model('Sport', app.processSchema(SportSchema))
}
