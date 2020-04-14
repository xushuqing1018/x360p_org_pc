<template>
	<div class="bg">
		<img class="ft-bg" src="../../img/ft-bg.png">
		<div class="ft-op">
			<Button class="ft-btn ft-manager" type="info" @click="ftManager">外教人员管理</Button>
			<Button class="ft-btn ft-review" type="info" @click="ftReview">外教报告</Button>
			<Button class="ft-btn ft-report" type="info" @click="ftReport">翻译情况汇总</Button>
		</div>
		<div class="ft-tip">外教端手机登录地址：<a :href="ftUrl" target="_blank">{{ftUrl}}</a></div>
	</div>
</template>
<script>
	export default {
		data() {
			return {
			}
		},
		computed: {
			ftUrl() {
				return this.$store.state.base_url+'/ft';
			}
		},
		methods: {
			ftReview() {
				this.$Modal.open('app/ft/ft-review.vue@modal',{
                    props:{
                    },
                    on:{
                        save: (e)=>{
                        }
                    }
                }).then(modal=>{
                    modal.show('外教报告')
                })
			},
			ftReport() {
				this.$Modal.open('app/ft/ft-report.vue@modal',{
                    props:{
                    },
                    on:{
                        save: (e)=>{
                        }
                    }
                }).then(modal=>{
                    modal.show('翻译情况汇总')
                })
			},
			ftManager() {
				this.$Modal.open('app/ft/ft-manager.vue@modal',{
                    props:{
                    },
                    on:{
                        save: (e)=>{
                        }
                    }
                }).then(modal=>{
                    modal.show('外教人员管理')
                })
			}
		}
	}
</script>

<style lang="less">
.bg {
	width: calc(~"100% - 200px");
	height: calc(~"100% - 173px");
	position: absolute;
	top: 123px;
	left: 200px;
	overflow: hidden;
	background-color: white;
	background-repeat: no-repeat;
	background-size: 100% 100%;
	text-align: center;
}

.ft-bg {
	width: 60%;
	margin-top: 5%;
}

.ft-op {
	height: 100px;
	width: 60%;
	position: relative;
	top: 80px;
	left: 20%;
}

.ft-btn {
	background-color: #3399FF;
	width: 105px;
}

.ft-manager {
	position: absolute;
	left: 7%;
}

.ft-review {
	position: absolute;
	left: 50%;
	transform: translate(-50%,0);
}

.ft-report {
	position: absolute;
	right: 7%;
}

.ft-tip {
	position: absolute;
	left: 41%;
	bottom: 5%;
	font-size: 13px;
}
</style>