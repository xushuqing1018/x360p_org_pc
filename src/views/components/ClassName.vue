<template>
    <a v-if="name" class="x-a-link text-info" @click="onClick">{{name}}</a>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            default: ''
        },
        detailAction: {
            type: Number,
            default: 0
        },
        cid: {
            type: Number,
            default: 0
        }
    },
    methods: {
        onClick() {
            let action = this.detailAction;
            if(action == 1) {
                this.$emit('click')
            }
            else if(action == 2) {
                this.$Modal.open('components/ClassInfoModal.vue@modal', {
                    props: {
                        id: this.cid
                    }
                }).then(modal => {
                    modal.show(`【${this.name}】班级详情`);
                })
            }
        }
    }
}
</script>

<style>

</style>
