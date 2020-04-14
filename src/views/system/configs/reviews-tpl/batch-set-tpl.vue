<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" :mask-closable="false" width="450">
		请选择要绑定的模板：
        <Select v-model="tplId" style="width:200px">
            <Option v-for="tpl in review_tpl_setting" :value="tpl.rts_id">{{tpl.name}}</Option>
        </Select>
		<div slot="footer">
			<Button type="ghost" @click="close" :disabled="saving">关闭</Button>
			<Button type="primary" @click="ok" :loading="saving">确定</Button>
		</div>
	</Modal>
</template>
<script>
	
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
import { error } from 'util';
	export default {
		mixins: [modal,common],
		props: {
			tplData: {
				type: Array,
				default: ()=>{
					return []
				}
            },
			objList: {
				type: Array,
				default: ()=>{
					return []
				}
            },
            tab: {
                type: Number,
                default: 0
            }
        },
        computed: {
            review_tpl_setting () {
				let list = this.$store.state.gvars.review_tpl_setting
				if(!_.isArray(list)){
					list = []
				}
				return list 
            },
            review_tpl_define () {
				let list = this.$store.state.gvars.review_tpl_define
				if(!_.isArray(list)){
					list = []
				}
				return list 
			},
        },
		data() {
			return {
                tplId: 0
			}
		},
		methods: {
			ok() {
                if(this.tplId == 0){
                    this.$Message.error('请选择需要设置的模板')
                    return
                }

                let pkName = '';
                if(this.tab == 1) {
                    pkName = 'lid'
                }
                else if(this.tab == 2) {
                    pkName = 'cid'
                }
                else if(this.tab == 3) {
                    pkName = 'sj_id'
                }

                let hasSetTplList = [],
                    noSetTplList = []
                this.objList.forEach(item => {
                    let pk = item[pkName];
                    let rtd = this.tplData.find(item2 => {
                        return item2[pkName] == pk
                    })
                    if(rtd) {
                        hasSetTplList.push({
                            [pkName]: item[pkName],
                            rts_id: this.tplId,
                            rtd_id: rtd.rtd_id
                        })
                    }
                    else {
                        noSetTplList.push({
                            [pkName]: item[pkName],
                            rts_id: this.tplId
                        })
                    }
                })

                let p1 = this.$http.post('review_tpl_defines',noSetTplList);
                let p2 = this.$http.post('review_tpl_defines/batchUpdate',hasSetTplList);
                Promise.all([p1, p2]).then(values => {
                    this.$Message.success('批量修改成功')
                    this.$emit('update')
                    this.close()
                },res => {
                    this.error(res.body.message)
                })
            }
		}
	}
</script>