<template>
    <div>
        <Alert show-icon>
            <p>格式:.jpg/png,推荐尺寸:300px*200px</p>
        </Alert>
        <table class="modal-table">
            <thead>
                <tr>
                    <th>
                        <div class="ivu-table-cell">标题</div>
                    </th>
                    <th>
                        <div class="ivu-table-cell">链接地址</div>
                    </th>
                    <th>
                        <div class="ivu-table-cell">图片</div>
                    </th>
                    <th>
                        <div class="ivu-table-cell">操作</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item,index) in info.banner_data" :key="index">
                    <td>
                        <div class="ivu-table-cell">
                            <Input
                                v-model="item.title"
                                size="small"
                                placeholder="标题"
                            ></Input>
                        </div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <Input
                                v-model="item.link"
                                size="small"
                                placeholder="链接地址"
                            ></Input>
                        </div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <img :src="item.img_url" style="width: 200px;height: 70px;" />
                            <c-upload v-model="item.img_url" btn-text="设置"></c-upload>
                        </div>
                    </td>
                    <td>
                        <div class="ivu-table-cell">
                            <Button type="text" icon="ios-trash" @click="del(item,index)"></Button>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="4">
                        <div class="text-center">
                            <Button type="default" long icon="plus" @click="add()">添加</Button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="mt-4">
            <Button type="primary" @click="ok">保存</Button>
        </div>
    </div>
</template>
<script>
import util from '@/libs/util'
import config from '@/libs/config.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import cUpload from 'c%/cUpload.vue'
export default {
    mixins: [common, config, globals],
    components: {
        cUpload
    },
    data() {
        return {
            info: {
                banner_data: []
            }
        }
    },
    mounted() {
        this.init_data()
    },
    methods: {
        add() {
            let item = {
                ban_id: 0,
                bid: this.bid$,
                img_url: '',
                link: '',
                title: '',
                app_id: 'student',
                position: 'home'
            }
            this.info.banner_data.push(item)
        },
        del(item, index) {
            if (item.ban_id > 0) {
                this.$Modal.confirm({
                    content: `确认要删除该图片吗？`,
                    onOk: () => {
                        this.$http.delete('banners/' + item.ban_id).then(
                            res => {
                                this.$Message.success('删除成功')
                                this.info.banner_data.splice(index, 1)
                            },
                            res => {
                                this.error(res.body.message)
                            }
                        )
                    }
                })
            } else {
                this.info.banner_data.splice(index, 1)
            }
        },
        init_data() {
            this.$rest('banners')
                .get({
                    app_id: 'student',
                    bid: this.bid$
                })
                .success(res => {
                    this.info.banner_data = res.list
                })
                .error(res => {
                    this.error(response.body.message || '操作失败~')
                })
        },
        ok() {
            try {
                this.info.banner_data.forEach(item => {
                    if (item.img_url == '') {
                        throw new Error('请上传图片')
                    }
                })
            } catch (e) {
                this.$Message.error(e.message)
                return
            }

            this.$rest('banners')
                .post(this.info)
                .success(res => {
                    this.$Message.success('保存成功')
                    this.init_data()
                })
                .error(res => {
                    this.error(response.body.message || '操作失败~')
                })
        }
    }
}
</script>