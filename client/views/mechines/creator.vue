<template>
  <v-dialog persistent :value="show" width="500">
    <v-card>
      <v-card-title
        class="headline lighten-2"
        primary-title
      >
        创建机器
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" ref="form" lazy-validation>
          <v-container>
            <v-layout wrap row>
              <v-flex sm6>
                <v-select
                  :items="countries"
                  v-model="country"
                  label="国家"
                  prepend-icon="map"
                  :rules="[rules.required]"
                />
              </v-flex>
              <v-flex sm6>
                <v-select
                  :disabled="!hasRegions"
                  :items="regions[country]"
                  v-model="region"
                  label="地区"
                  prepend-icon="streetview"
                />
              </v-flex>
            </v-layout>
            <v-select
              :items="mechineTypes"
              v-model="type"
              label="机器类型"
              prepend-icon="memory"
              :rules="[rules.required, rules.oneOf(mechineTypes)]"
            />
            <v-select
              :items="communicationTypes"
              label="通讯协议"
              v-model="communication"
              prepend-icon="forum"
            />
            <v-text-field
              label="公网IP"
              v-model="publicIp"
              :rules="[rules.required, rules.ip]"
            />

            <v-layout v-if="communication === 'proxy'" wrap row>
              <v-flex sm5>
                <v-text-field
                  label="Port"
                  type="number"
                  v-model="port.from"
                  :rules="[rules.required, rules.interger, rules.gt(1023), rules.lt(49151), rules.lt(port.to)]"
                />
              </v-flex>
              <v-flex sm2 align-self-center text-sm-center>至</v-flex>
              <v-flex sm5>
                <v-text-field
                  label="Port"
                  type="number"
                  v-model="port.to"
                  :rules="[rules.required, rules.interger, rules.gt(1023), rules.lt(49151), rules.gt(port.from)]"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <div class="pb-2 pr-2">
          <v-btn color="success" @click="create" :disabled="!valid">创建</v-btn>
          <v-btn color="error" @click="$emit('cancle')">取消</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import request from 'framework/request'


export default {
  props: ['show'],
  data() {
    return {
      countries: [
        { text: '美国', value: 'america' },
        { text: '日本', value: 'japan' },
        { text: '中国', value: 'chinese'},
      ],

      regions: {
        america: [],
        japan: [
          { text: '东京', value: 'tokyo' }
        ],
        chinese: [],
      },
      mechineTypes: [
        { text: '端口机', value: 'port' },
        { text: '独立主机', value: 'host' },
      ],
      communicationTypes: [
        { text: 'proxy', value: 'proxy' },
      ],

      valid: true,

      type: 'port',
      country: '',
      region: '',
      publicIp: '',
      port: {
        from: '',
        to: '',
      },
      communication: 'proxy',

      rules: {
        required: value => !!value || '必填',
        oneOf: options => value => options.some(item => item === value || item.value === value) || '无效值',
        interger: value => /^\d+$/.test(value) || '必须为整数',
        gt: num => value => !num || value > num || `需要大于${num}`,
        lt: num => value => !num || value < num || `需要小于${num}`,
        ip: value => /\d{1,3}(\.\d{1,3}){3}/.test(value) || '请输入正确的ip格式：xxx.xxx.xxx.xxx',
      },
    }
  },

  computed: {
    hasRegions() {
      const { country, regions } = this

      return country in regions && regions[country].length
    }
  },
  methods: {
    async create() {
      if (!this.$refs.form.validate()) return;

      const { type, country, region, publicIp, communication } = this
      const port = { from: parseInt(this.port.from), to: parseInt(this.port.to) }
      const mechines = Array.apply(null, { length: port.to - port.from + 1 })
        .map((value, index) => index + port.from)
        .map(value => ({ type, country, region, publicIp, communication, port: value }))


      const res = await request
        .post('/api/mechines')
        .send(mechines)

      this.$emit('created', { mechines: res.body })
    },
  }
}
</script>
<style lang="postcss">

</style>
