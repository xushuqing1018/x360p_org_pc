export default {
    data() {
        return {
            column_keys: {
                operate: {
                    title: '操作',
                    width: 70,
                    disabled:true
                },
                row_number: {
                    type: 'index',
                    title:'#',
                    width: 50,
                    align: 'center',
                    disabled:true
                },	
                student_name: {
                    title: '姓名',
                    width:200,
                    show: true,
                    disabled:true
                },
                sid:{
                    title:'ID',
                    width:80,
                    show:true
                },
                sex: {
                    title: '性别',
                    
                    show: false
                },
                age: {
                    title: '年龄',
                    
                    show: true
                },
                birth_time: {
                    title: '生日',
                    
                    show: true
                },
                status: {
                    title: '状态',
                    
                    show: true
                },
                lesson_rate: {
                    title: '剩余课时/总课时',
                    
                    show: true
                },
                lesson_expire: {
                    title: '课程有效日期',
                    
                    show:false
                },
                money: {
                    title: '钱包余额',
                    
                    show: true,
                    sortable: 'custom'
                },
                sno: {
                    title: '学号',
                    
                    show: true,
                    sortable: 'custom'
                },
                card_no: {
                    title: '卡号',
                    
                    show: true
                },
                nick_name: {
                    title: '昵称/英文名',
                    
                    show: true
                },
                first_tel: {
                    title: '手机号',
                    
                    show: true
                },
                vip_level: {
                    title: '会员等级',
                    
                    show:false
                },
                service_level: {
                    title: '服务星级',
                    
                    show: false
                },
                first_family_rel: {
                    title: '关系/姓名',
                    
                    show: true
                },
                second_tel: {
                    title: '第二电话',
                    
                    show: false
                },
                second_family_rel: {
                    title: '关系/姓名',
                    
                    show: false
                },
                first_openid: {
                    title: '微信',
                    show: true,
                    
                },
                school_id_text: {
                    title: '公立学校',
                    
                    show: false
                },
                shool_grade: {
                    title: '年级',
                    
                    show: false
                },
                school_class: {
                    title: '班级',
                    
                    show: false
                },
                id_card_no:{
                    title:'身份证号',
                    
                    show:false
                },
                ename: {
                    title: '学管师',
                    
                    show: false
                },
                referer_student_name: {
                    title: '介绍人',
                    show: false,
                   
                },
                in_time:{
                    title: '报名时间',
                    
                    show: false,
                },
                bid:{
                    title: '校区',
                    
                    show: false,
                },
                pj_ids:{
                    title: '项目',
                    
                    show:false
                },
                mc_name: {
                    title: '市场渠道',
                    
                    show:false
                },
                from_did: {
                    title: '招生来源',
                    
                    show:false,
                    sortable: 'custom'
                },
                is_face_input: {
                    title: '人脸采集',
                   
                    show: false
                }
            }
        }
    }
}