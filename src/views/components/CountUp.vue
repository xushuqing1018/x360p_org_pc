<template>
    <div>
        <p :class="className" :style="{display: 'inline-block',textAlign: 'center', color: color, fontSize: countSize, fontWeight: countWeight}">
            <Icon :type="iconType" v-if="iconType"></Icon>
            <span v-cloak :id="idName">{{ startVal }}</span>
            <span v-if="unit">{{ unit }}</span>
            <slot name="append"></slot>
        </p>
        <slot name="intro"></slot>
    </div>
</template>

<script>
import CountUp from 'countup';

function transformValue (transform,val) {
    let endVal = 0;
    let unit = '';
    if(transform) {
        if (val < 100000) {
            endVal = val;
        } else if (val >= 100000 && val < 1000000) {
            endVal = parseInt(val / 1000);
            unit = 'K+';
        } else if (val >= 1000000 && val < 10000000000) {
            endVal = parseInt(val / 1000000);
            unit = 'M+';
        } else {
            endVal = parseInt(val / 1000000000);
            unit = 'B+';
        }
        return {
            val: endVal,
            unit: unit
        };
    }else{
        return {
            val: val,
            unit: unit
        };
    }
}

export default {
    data () {
        return {
            unit: '',
            demo: {}
        };
    },
    name: 'countUp',
    props: {
        transform: {
            type: Boolean,
            default: true
        },
        iconType: {
            type: String,
            default: ''
        },
        idName: String,
        className: String,
        startVal: {
            type: Number,
            default: 0
        },
        endVal: {
            type: Number,
            required: true
        },
        decimals: {
            type: Number,
            default: 0
        },
        duration: {
            type: Number,
            default: 2
        },
        delay: {
            type: Number,
            default: 500
        },
        options: {
            type: Object,
            default: () => {
                return {
                    useEasing: true,
                    useGrouping: true,
                    separator: ',',
                    decimal: '.'
                };
            }
        },
        color: String,
        countSize: {
            type: String,
            default: '35px'
        },
        countWeight: {
            type: Number,
            default: 700
        },
        introText: [String, Number]
    },
    mounted () {
        this.$nextTick(() => {
            setTimeout(() => {
                let res = transformValue(this.transform,this.endVal);
                let endVal = res.val;
                this.unit = res.unit;
                let demo = {};
                this.demo = demo = new CountUp(this.idName, this.startVal, endVal, this.decimals, this.duration, this.options);
                if (!demo.error) {
                    demo.start();
                }
            }, this.delay);
        });
    },
    watch: {
        endVal (val) {
            let res = transformValue(this.transform,val);
            let endVal = res.val;
            this.unit = res.unit;
            if(this.demo.rAF) {
                this.demo.update(endVal);
            }
        }
    }
};
</script>
