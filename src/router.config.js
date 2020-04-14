const routers = {
	app: {
		redirect: 'app/center',
		file: 'app/index',
		title: '应用',
		sub: {
			books: {
				title: '图书管理系统',
				file: 'app/books'
			},
			booksl: {
				title: '书库管理',
				file: 'app/books/list'
			},
			materials: {
				file: 'app/materials',
				title: '物品管理',
				bid: 0,
			},
			cshop: {
				file: 'app/cshop',
				title: '积分商城',
				sub: {
					gift: {
						title: '积分礼品',
						file: 'app/cshop/gift'
					},
					order: {
						title: '积分订单',
						file: 'app/cshop/order'
					},
					integral: {
						title: '学员积分',
						file: 'business/student/integral'
					}
				}
			},
			achievement: {
				file: 'app/achievement',
				title: '成绩管理',
				sub: {
					exam: {
						title: '考试管理',
						file: 'app/achievement/exam'
					},
					score: {
						title: '成绩查询',
						file: 'app/achievement/score'
					}
				}
			},
			knowledge: {
				file: 'app/knowledge',
				title: '知识库管理'
			},
			fans: {
				bid: 0,
				title: '粉丝管理'				
			},
			fans_info: {
				title: '粉丝详情',
				path: 'fans/:id',
				bid: 0,
			},
			event: {
				file: 'app/event',
				title: '活动管理',
				sub: {					
					list: {
						title: '活动列表',
						file: 'app/event/list'
					},
					signup: {
						title: '报名管理',
						file: 'app/event/signup'
					}
				}
			},
			franchisees: {
				file: 'app/franchisees',
				title: '加盟商管理',
				bid: 0,
				sub: {
					archive: {
						title: '盟商资料',
						file: 'app/franchisees/archive'
					},
					contract: {
						title: '加盟合同',
						file: 'app/franchisees/contract'
					},
					service: {
						title: '督导服务',
						file: 'app/franchisees/service'
					},
					system: {
						title: '校360系统',
						file: 'app/franchisees/system'
					},
					report: {
						title: '加盟商报表',
						file: 'app/franchisees/report'
					}
				}
			},
			franchisees_info: {
				title: '加盟商详情',
				path: 'franchisees/archive/:id',
				file: 'app/franchisees/archive/info',
				bid: 0,
				sub: {
					service: {
						title: '服务记录',
						file: 'app/franchisees/archive/record/service'
					},
					contract: {
						title: '合同记录',
						file: 'app/franchisees/archive/record/contract'
					},
					contact: {
						title: '联系人',
						file: 'app/franchisees/archive/record/contact'
					}
				}
			},
			flow: {
				file: 'app/flow',
				title: '流程审批',
				sub: {					
					list: {
						title: '流程审批',
						file: 'app/flow/list'
					},
					management: {
						title: '流程管理',
						file: 'app/flow/management'
					},
					type: {
						title: '流程类型',
						file: 'app/flow/type'
					}
				}
			},
			broadcast: {
				file: 'app/broadcast',
				title: '高级公告',
				sub: {					
					list: {
						title: '公告列表',
						file: 'app/broadcast/list'
					},
					check: {
						title: '点评审核',
						file: 'app/broadcast/check'
					}
				}
            },
            appointment: {
				file: 'app/appointment',
				title: '一对一预约',
				sub: {					
					list: {
						title: '预约设置',
						file: 'app/appointment/list'
					},
					check: {
						title: '预约审核',
						file: 'app/appointment/check'
                    },
                    attend: {
						title: '预约签到',
						file: 'app/appointment/attend'
					}
				}
			},
			questionnaire: {
				title: '问卷管理',
				file: 'app/questionnaire',
			},
			acm: {
				title: '内容管理',
				file: 'app/acm',
			},
			webcall: {
				file: 'app/webcall',
				title: '云呼叫'
			},
			faceattl: {
				title: '人脸考勤记录',
				file: 'app/faceatt/list'
			},
			faceatt: {
				title: '人脸考勤',
				file: 'app/faceatt'
			},
			ft: {
				title: '外教端',
				file: 'app/ft'
			},
			live: {
				title: '直播课',
				file: 'app/live',
				bid: 0,
				redirect: './live/room',
				sub: {
					room:{
						title: '房间管理',
						file: 'app/live/room'
					},
					chat:{
						title: '聊天管理',
						file: 'app/live/chat'
					},
					file:{
						title: '文件管理',
						file: 'app/live/file'
					},
				}
			},
			center: {
				title: '应用中心',
				file: 'app/center'
			},
			app_info: {
				title: '应用详情',
				path: 'center/:id',
				file: 'app/center/info',
				bid: 0
			}
		}
	},
	profile:{
		bid:0,
		title:'个人资料'
	},
	performance:{
		bid:0,
		title:'我的业绩',
	},
	filepackage: {
		bid: 2,
		title:'我的文件'
	},
	support: {
		redirect:'support/support',
		file:'support/index',
		bid:0,
		title:'服务支持',
		sub: {
			support: '服务中心',
			tickets: '工单记录',
			services: '服务记录',
			trains: '培训安排',
			tickets_info: {
				path:'tickets/:id',
				file:'support/tickets/info',
				title:'工单详情',
				bid:0
			},
			services_info: {
				path:'services/:id',
				file:'support/services/info',
				title:'服务详情',
				bid:0
            },
            csf: '总部课标',
		}
	},
	dashboard:{
		redirect:'dashboard/home',
		file:'dashboard/index',
		bid:1,
		title:'工作台',
		sub:{
			home:{
				bid:1,
				title:'总览'
			},
			signup:'新生报名',
			payment:'老生缴费',
			transfer:'结转',
			refund:'退费',
			handover:'交班',
			roles: {
				bid: 0,
				title: '角色权限'
			},
			situation:'学情服务',
			export: {
				bid: 0,
				title: '我的导出'
			}
		}
	},
	recruiting:{
		redirect:'recruiting/market',
		title:'招生',
		file:'recruiting/index',
		sub:{
			market: {
				file: 'recruiting/market',
				title: '市场名单',
				sub: {
					overview: {
						title: '概览',
						file: 'recruiting/market/overview'
					},
					channel: {
						title: '来源渠道',
						file: 'recruiting/market/channel'
					},
					clue: {
						title: '市场名单',
						file: 'recruiting/market/clue'
					},
					recommend: {
						title: '推荐名单',
						file: 'recruiting/market/recommend'
					}
				}
			},
			clue_info: {
				title: '市场名单详情',				
				path: 'market/:id',
				bid:0,
				file:'recruiting/market/market-info',
			},			
			list:{
				file: 'recruiting/list',
				title: '客户名单',				
				sub: {
					overview: {
						title: '概览',
						file: 'recruiting/list/overview'
					},
					customer: {
						title: '客户名单',
						name: 'customer',
						file: 'recruiting/list/customer'
					},	
					lost: {
						title: '流失学员',
						name: 'lost',
						file: 'recruiting/list/dropout'
					},
					lostwarn: {
						title: '流失预警学员',
						name: 'lostwarn',
						file: 'recruiting/list/stu_loss_warn'
					}
				}
			},
			followingmulti: {
				title: '跟单',
				bid: 0
			},	
			customer_info: {
				title: '客户详情',				
				path: 'list/:id',
				bid:0,
				sub:{
					following:{
						title:'沟通记录',
						file:'recruiting/following/follow-record'
					},
					archive:{
						title:'学员档案',
						file:'recruiting/list/student-archive'
					}
				}
			},
			following: {
				file: 'recruiting/following',
				title: '跟进情况',
				sub: {
					overview: {
						title: '概览',
						file: 'recruiting/following/overview'
					},
					flist: {
						title: '跟进记录',
						file: 'recruiting/following/list'
					},
					summary: {
						bid: 2,
						title: '转化统计',
						file: 'recruiting/following/summary'
					}
				}
			},
			audition: {
				file: 'recruiting/audition',
				title: '试听管理',
				sub: {
					overview: {
						title: '概览',
						file: 'recruiting/audition/overview'
					},
					aslist: {
						title: '试听记录',
						file: 'recruiting/audition/list'
					},
					aclist: {
						title: '试听排课',
						file: 'recruiting/audition/trial-arrange-list'
					},
					assess: {
						title: '一对一评估',
						file: 'recruiting/audition/assess'
					}
				}
			},
			demo: {
				file: 'recruiting/demo',
				title: '体验课管理',
				sub: {
					overview: {
						title: '概览',
						file: 'recruiting/demo/overview'
					},
					lesson: {
						title: '体验课课程',
						file: 'recruiting/demo/lesson'
					},
					signup: {
						title: '体验课报名',
						file: 'recruiting/demo/signup'
					},
					class: {
						title: '体验课班级',
						file: 'recruiting/demo/class'
					}
				}
			},
			class_info:{
				path:'demo/class/:id',
				file:'recruiting/demo/class/info',
				title:'体验班详情',
				bid:0
			},
			order_detail:{
				path:'demo/signup/:id',
				file:'recruiting/demo/signup/order-detail',
				title:'报名详情',
				bid:0
			},
		}
	},
	business:{
		redirect:'business/student',
		file:'business/index',
		title:'运营',
		sub:{
			student:{
				file:'business/student',
				title: '学员管理',
				sub: {
					overview: {
						title: '概览',
						file: 'business/student/overview'
					},
					archive: {
						title: '学员档案',
						file: 'business/student/archive'
					},
					assign: {
						title: '学员分配',
						file: 'business/student/assign'
					},
					employee: {
						title: '员工学员关系',
						file: 'business/student/employee-student'
					},
					integral: {
						title: '学员积分',
						file: 'business/student/integral'
					},
					class: {
						title: '学员分班',
						file: 'business/student/class'
					},
				}
			},
			student_info:{
				path:'student/:id',
				title:'档案详情',
				bid:0,
				sub:{
					lesson:{
						bid: 1,
						title:'课时记录',
						file:'business/student/record/lesson'
					},
					order:{
						title:'订单记录',
						file:'business/student/record/order'
					},
					money:{
						title:'缴费记录',
						file:'business/student/record/money'
					},
					class: {
						title:'分班记录',
						file:'business/student/record/class'
					},
					arrange:{
						bid: 1,
						title:'排课记录',
						file:'business/student/record/arrange'
					},
					attend:{
						title:'考勤记录',
						file:'business/student/record/attend'
					},
					hour: {
						title:'课耗记录',
						file:'business/student/record/hour'
					},
					leave:{
						title:'请假记录',
						file:'business/leave/leave-record'
					},
					absence:{
						title:'缺勤记录',
						file:'business/student/record/absence'
					},
					review: {
						title: '课评记录',
						file: 'business/student/record/review'
					},
					record: {
						title: '服务记录',
						file:'business/student/record/service-record'
					},
					task: {
						title: '服务安排',
						file:'business/student/record/service-task'
					},
					visit:{
						title:'回访记录',
						file:'business/student/record/visit'
					},
					log:{
						title:'操作日志',
						file:'business/student/record/log'
					}
				}
			},
			order:{
				file:'business/order',
				title:'报名管理',
				sub:{
					overview: {
						title: '概览',
						file: 'business/order/overview'
					},
					offline: {
						title: '线下报名',
						name:'list',
						file: 'business/order/offline'
					},
					online: {
						title: '线上报名',
						file: 'business/order/online'
					},
					items: {
						title: '报名项目',
						name: 'items',
						file: 'business/order/order-items'
					},
					hours: {
						title: '课时管理',
						name: 'hours',
						file: 'business/order/student-lesson'
					},
					referer: {
						title: '转介绍管理',
						name: 'referer',
						file: 'business/order/referer'
					}
				}
			},
			order_detail:{
				path:'order/:id',
				file:'business/order/order-detail',
				title:'报名详情',
				bid:1
			},
			class:{
				file:'business/class',
				title: '班级管理',
				sub: {
					overview: {
						title: '概览',
						file: 'business/class/overview'
					},
					list: {
						title: '班级',
						name: 'list',
						file: 'business/class/list'
					},
					templist: {
						title: '临时班级',
						name: 'templist',
						file: 'business/class/temp-class-list'
					},
					students: {
						title: '班级学员',
						name: 'students',
						file: 'business/class/students'
					}
				}
			},
			class_info:{
				path:'class/:id',
				title:'班级详情',
				bid:1
			},
			arrange:{
				file: 'business/arrange',
				title: '排课管理',
				sub: {
					overview: {
						title: '概览',
						file: 'business/arrange/overview'
					},
					lists: {
						title: '排课',
						file: 'business/arrange/lists'
					},
					schedule: {
						title: '排课表',
                        file: 'business/arrange/schedule',
                        bid: 2
					},
					plan: {
						title: '排课计划',
						file: 'business/arrange/plan'
					},
					bk: {
						title: '约课记录',
						file: 'business/arrange/bk'
					}
				}
			},
			attendance: {
				file: 'business/attendance',
				title: '考勤管理',
				sub: {
					overview: {
						title: '概览',
						file: 'business/attendance/overview'
					},
					teach: {
						title: '授课记录',
						file: 'business/attendance/attendance-class'
					},
					student: {
						title: '学员考勤记录',
						file: 'business/attendance/attendance-student'
					},
					swipe: {
						title: '刷卡记录',
						file: 'business/attendance/swiping-card-record'
					},
					leave: {
						title: '请假记录',
						file: 'business/leave/leave-record'
					},
					absence: {
						title: '缺课记录',
						file: 'business/absence/list'
					},
					makeup: {
						title: '补课记录',
						file: 'business/makeup/list'
					}
				}
			},
			hour: {
				file: 'business/hour',
				title: '课耗管理',
				sub: {
					overview: {
						title: '概览',
						file: 'business/hour/overview'
					},
					student: {
						title: '学员课耗',
                        file: 'business/hour/student-lesson-hour',
                        bid: 2
					},
					lesson: {
						bid:2,
						title: '课程产出',
						file: 'business/hour/lesson-hour'
					},
					employee: {
						bid:2,
						title: '教师产出',
						file: 'business/hour/employee-lesson-hour'
					},
					teacher: {
						bid:2,
						title: '学管师产出',
						file: 'business/hour/teacher-lesson-hour'
					}
				}
			},
			iae:{
				file:'business/iae',
				title:'财务管理',
				sub:{
					overview:{
						title:'概览',
						file:'business/iae/overview'
					},
					tally:{
						title:'收支流水',
						name:'tally',
						file:'business/iae/tally'
					},
					bills:{
						title:'缴费记录',
						file:'business/iae/receipt-bills'
					},
					refund:{
						title:'退费记录',
						file:'business/iae/refund-history'
					},
					receipt: {
						title:'业绩记录',
						bid:2,
						file:'business/iae/employee-receipt'
					},
					hand:{
						bid:0,
						title:'交款记录',
						file:'business/iae/handover-money'
					},
					asset:{
						title:'资产负债',
						file:'business/iae/asset'
					},
					summary:{
						title:'收支汇总',
						file:'business/iae/summary'
					},
					type:{
						title:'收支类别',
						file:'business/iae/type'
					},
					help:{
						title:'辅助核算',
						file:'business/iae/help'
					}
				}
			},
			goods:'物品管理'
		}
	},
	service:{
		redirect:'service/bclass',
		file:'service/index',
		title:'服务',
		sub:{
			bclass: {
				file:'service/bclass',
				title:'课前服务',
				sub:{
					overview:'概览',
					remind:'课前提醒',
					prepare: '备课服务',
					notice:'到离校通知',
				}
			},
			aclass: {
				file:'service/aclass',
				title:'课后服务',
				sub:{
					overview:'概览',
					comments:'课评服务',
					homework:'作业服务',
					artwork: '作品服务',
					visit:'学员回访',
					edugrowup:'成长对比',
				}
			},
			edugrowup_info:{
				path: 'edugrowup/:id',
				file: 'service/aclass/edugrowup/edugrowup-info',
				title:  '对比详情'
			},
			calendar: {
				file: 'service/calendar',
				title: '服务日历',
				sub: {
					month:'月视图'
				}
			},
			prepare_detail: {
				path: 'prepare/:id',
				file: 'service/bclass/prepare/prepare-detail',
				title: '备课详情'
			},
			homework_info:{
				path: 'homework/:id',
				file: 'service/aclass/homework/homework-info',
				title:  '作业详情'
			},
			achievement:'成绩管理',
			study:{
				file:'service/study',
				title:'学习管家',
				sub:{
					overview: {
						title: '概览',
						file: 'service/sm/overview'
					},
					student: {
						title: '账号管理',
						file: 'service/sm/tab-student'
					},
					log:{
						title: '登录情况',
						file: 'service/sm/tab-log'
					},
					usercard:{
						title: '用户会员卡',
						file: 'service/sm/tab-card'
					},
					chat:{
						title: '聊天记录',
						file: 'service/sm/tab-chat'
					},
					reply:{
						title: '学员回评',
						file: 'service/sm/tab-reply'
					},
					complaint:{
						title: '投诉建议',
						file: 'service/sm/tab-complaint'
					}
				}
			},
			situation:'学情服务',
			event: {
				file: 'service/event',
				title: '活动列表',
				sub: {					
					list: {
						title: '活动列表',
						file: 'service/event/list'
					},
					signup: {
						title: '报名管理',
						file: 'service/event/signup'
					}
				}
			},
			week: {
				file: 'service/week',
				title: '周期服务',
				sub: {					
					service_remind: {
						title: '服务提醒',
						file: 'service/week/service-remind'
					},
					service_task: {
						title: '服务记录',
						file: 'service/week/service-task'
					},
					regular_service_rule: {
						title: '服务规则',
						file: 'service/week/regular-service-rule'
					}
				}
			}
		}
	},
	reports:{
		redirect:'reports/overview',
		file:'reports/index',
		title:'报表',
		sub:{
			overview:{
				title:'运营总表',
				bid:0
			},
			overview2:{
				title:'运营总表-简要版',
				bid:0
			},
			overview3:{
				title:'预收+产能+结余',
				bid:0
			},
			customer:{
				bid:2,
				title:'招生统计表'
			},
			on:{
				bid:2,
				title:'学员分析报表'
			},
			class:{
				bid:2,
				title:'班级报表'
			},
			income:{
				bid:2,
				title:'课耗确收表'
			},
			attendance:{
				bid:2,
				title:'考勤统计表'
			},
			performance:{
				file: 'reports/performance',
				title:'业绩报表',
				sub: {
					employee: {
						title: '人员业绩',
						file: 'reports/performance/by-employee'
					},
					branch: {
						bid: 0,
						title: '校区业绩',
						file: 'reports/performance/by-branch'
					},
					stats: {
						title: '签单业绩汇总',
						file: 'reports/performance/performance-stats'
					},
					teacher: {
						title: '老师业绩汇总',
						file: 'reports/performance/teacher-achieve'
					},
					renew:{
						title: '续费业绩',
						file: 'reports/performance/performance-renew'
					}
				}
			},
			finace:{
				title:'收支表'
			},
			service:{
				title:'服务报表'
			},
			trial:{
				bid:1,
				title:'试听报读统计表'
			},
			lessonhour:{
				bid:0,
				title: '课时统计表'
			},
			demolesson:{
				bid:1,
				title:'体验课报表'
			},
			ki:{
				bid:1,
				title:'关键指标'
			}
		}
	},
	system:{
		redirect:'system/configs/params',
		file:'system/index',
		title:'系统',
		sub:{
			configs:{
				file:'system/configs/index',
				redirect:'configs/params',
				title:'系统设置',
				sub:{
					params:{
						bid:0,
						title:'系统参数'
					},
					ui:{
						bid:0,
						title:'界面设置'
					},
					print:{
						bid:0,
						title:'打印模板设置'
					},
					wxmp:{
						bid:0,
						file:'system/configs/wxmp/wxmp',
						title:'微信公众号设置'
					},
					account:{
						bid:1,
						title:'收款账户设置'
					},
					cardtype:{
						bid:1,
						title:'会员卡设置'
					},
					payment:{
						bid:0,
						title:'支付设置'
					},
					storage:{
						bid:0,
						title:'云存储设置'
					},
					mobile:{
						bid:0,
						title:'移动端设置'
					},
					service_standard:{
						bid:0,
						title:'服务标准设置',
					},
					credit_tpl: {
						bid:0,
						title:'积分点评设置',
					},
					reviews_tpl:{
						bid:0,
						title:'课评模板设置',
						file:'system/configs/reviews-tpl/index'
					},
					homework_tpl: {
						bid: 0,
						title: '作业模板设置',
						file: 'system/configs/homework-tpl/index'
					},
					template:{
						bid:0,
						title:'模板消息设置'
					},
					sms:{
						bid:0,
						title:'短信模板设置'
					},
					wechat:{
						bid:0,
						title:'微信模板设置'
					},
					business_code:{
						bid:0,
						title:'前台业务码设置'
					},
					recommend: {
						bid:0,
						title:'推荐有奖设置'
					},
					qrsign: {
						bid: 0,
						title: '市场名单设置'
					},
					customer_fields:{
						bid:0,
						title:'自定义字段'
					},
					disable_fields:{
						bid:0,
						title:'可选字段'
					},
					api:{
						bid:0,
						title:'API接口配置'
					},
					maintenance:{
						bid:0,
						title:'系统维护'
					}
				}
			},
			basic: {
				redirect:'basic/lesson',
				file:'system/basic/index',
				title:'基础',
				sub:{
					lesson:{
						bid:0,
						title:'课程管理'
					},
					course_standard_file: {
						bid:1,
						title: '课标管理'
					},
					subject:{
						bid:0,
						title:'科目设置'
					},
					teachers:{
						bid:1,
						title:'%老师%管理'
					},
					classrooms:{
						bid:1,
						title:'教室设置'
					},
					time:{
						bid:0,
						title:'上课时间段管理'
					},
					holiday:{
						bid:0,
						title:'节假日设置'
					},
					fees: '杂费管理',
					questionnaire:'问卷管理',
					schools:'公立学校管理',
					mobile_page: '移动端页面管理',
					lesson_suit_define: '学习套餐',
					debit: '储值卡管理'
				}
			},
			staff: {
				redirect:'staff/departments',
				file:'system/staff/index',
				title:'人员设置',
				sub: {
					departments:{
						bid:0,
						title:'部门设置'
					},
					employees:{
						bid:0,
						title:'员工管理'
					},
					roles:{
						bid:0,
						title:'权限组管理'
					}
				}
			},
			staff_employee_info:{
				path:'staff/employee/:id',
				title:'员工详情',
				bid:0
			},
			dicts:{
				bid:0,
				title:'数据字典',
				file:'system/dicts/index'
			},
			orgs:{
				bid:0,
				title:'加盟商管理'
			},
			logs:{
				bid:1,
				title:'日志'
			}
		}
	}
}
export default {
	'404':{
		sync:true,
		public:true,
		title:'页面不存在'
	},
	login:{
		sync:true,
		public:true,
		title:'登录'
	},
	tklogin:{
		sync:true,
		public:true,
		title:'登录'
	},
	logout:{
		sync:true,
		public:true,
		title:'退出登录'
	},
	forgotpw:{
		sync:true,
		public:true,
		title:'忘记密码'
	},
	lock:{
		sync:true,
		public:true,
		title:'锁定屏幕'
	},
	root:{
		path:'/',
		redirect:'/dashboard/home',
		title:'首页',
		file:'layout',
		sub:routers
	},
	any:{
		path:'*',
		redirect:'/404',
		hidden:true,
		public:true
	}
}