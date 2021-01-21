<template>
  <v-app>
    <v-content
      :class="{'full-height' : $vuetify.breakpoint.lgAndUp}"
      class="no-footer font-primary"
    >
      <v-container
        fill-height
        fluid
      >
        <v-card
          class="v-card--rounded container fluid fill-height pa-0"
          elevation="8"
          raised
        >
          <v-layout
            fill-height
            row
            wrap
          >
            <v-flex
              class="secondary fill-height hidden-sm-and-down"
              md7
              order-xs1
              xs12
            >
              <template v-if="isRegisterPage">
                <v-layout
                  column
                  fill-height
                >
                  <v-flex ml-5>
                    <v-layout justify-start>
                      <v-flex md11 xs10>
                        <v-card
                          :class="{'mt-5 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                          color="transparent"
                          dark
                          flat
                        >
                          <v-card-text class="pa-0">
                            <h1
                              class="headline font-weight-bold mb-4"
                              v-html="$t('register.main.aside.heading', { days: 15 })"
                            />
                            <div>
                              <ul class="body-2 font-weight-bold secondary--text text--lighten-5">
                                <li>{{ $t('register.main.aside.subheadingBullet1') }}</li>
                                <li>{{ $t('register.main.aside.subheadingBullet2') }}</li>
                                <li>{{ $t('register.main.aside.subheadingBullet3') }}</li>
                              </ul>
                              <p
                                class="white--text font-weight-bold mt-4 ml-2"
                                v-html="$t('register.main.aside.subheading2')"
                              />
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex mt-2>
                    <v-layout align-center justify-center style="background-color:#ffffff">
                      <img
                        :src="require('@/assets/images/rating-banner@2x.png')"
                        :srcset="`${require('@/assets/images/rating-banner.png')} 1x, ${require('@/assets/images/rating-banner@2x.png')} 2x`"
                        alt="CloudRadar"
                        class="d-flex"
                        style="max-width:100%; height: auto;"
                      />
                    </v-layout>
                    <v-layout>
                      <v-flex class="white--text" mt-5 mx-5 xs10>
                        <v-layout column>
                          <v-flex class="font-italic subheading" mt-4>
                            {{ $t('register.main.aside.quote.body') }}
                          </v-flex>
                          <v-flex class="text-xs-right body-2" mt-4>
                            <div class="text-capitalize font-weight-bold">{{
                                $t('register.main.aside.quote.name')
                              }}
                            </div>
                            <div>{{ $t('register.main.aside.quote.role') }}</div>
                            <div class="text-capitalize caption font-weight-bold">{{
                                $t('register.main.aside.quote.company')
                              }}
                            </div>
                          </v-flex>
                        </v-layout>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                  <v-flex shrink>
                    <v-layout justify-start ml-5>
                      <v-flex
                        lg8
                        md11
                        xs10
                      >
                        <v-footer
                          :class="{'mt-3 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                          color="transparent"
                          dark
                          height="40"
                        >
                          <v-layout align-center fill-height>
                            <v-flex
                              class="caption"
                              pr-3
                              shrink
                            >
                              {{ $t('phrase.copyright') }}
                            </v-flex>
                            <v-flex
                              class="caption"
                              shrink
                            >
                              {{ $t('phrase.rightsReserved') }}
                            </v-flex>
                          </v-layout>
                        </v-footer>
                      </v-flex>
                    </v-layout>
                  </v-flex>
                </v-layout>
              </template>
              <template v-else>
                <v-img
                  :src="require('@/assets/images/notebook@2x.png')"
                  class="fill-height auth-background"
                  position="right 40vh"
                >
                  <v-layout
                    column
                    fill-height
                  >
                    <v-flex>
                      <v-layout
                        justify-center
                        row
                      >
                        <v-flex
                          lg8
                          md11
                          xs10
                        >
                          <v-card
                            :class="{'mt-5 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                            color="transparent"
                            dark
                            flat
                          >
                            <v-card-text class="pa-0">
                              <template v-if="route === 'team'">
                                <h1
                                  class="display-1 font-weight-bold mb-4"
                                  v-html="$t('register.joinTeamHeading')"
                                />
                                <div>
                                  <p
                                    class="headline secondary--text text--lighten-5"
                                    v-html="$t('register.youWereInvitedToJoinATeam')"
                                  />
                                </div>
                              </template>
                            </v-card-text>
                          </v-card>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                    <v-flex/>
                    <v-flex shrink>
                      <v-layout
                        justify-center
                        row
                      >
                        <v-flex
                          lg8
                          md11
                          xs10
                        >
                          <v-footer
                            :class="{'mt-3 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                            color="transparent"
                            dark
                            height="48"
                          >
                            <v-layout
                              align-center
                              fill-height
                              row
                            >
                              <v-flex
                                class="caption"
                                pr-3
                                shrink
                              >
                                {{ $t('phrase.copyright') }}
                              </v-flex>
                              <v-flex
                                class="caption"
                                shrink
                              >
                                {{ $t('phrase.rightsReserved') }}
                              </v-flex>
                            </v-layout>
                          </v-footer>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-img>
              </template>
            </v-flex>

            <v-flex md5 xs12>
              <v-layout column fill-height>
                <v-flex shrink>
                  <v-layout justify-center>
                    <v-flex lg8 md11 xs10>
                      <Logo
                        :class="{'mt-5 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                        size="lg"
                      />
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex>
                  <v-layout
                    align-center
                    fill-height
                    justify-center
                  >
                    <v-flex lg8 md11 xs10>
                      <nuxt/>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex shrink>
                  <v-layout
                    justify-center
                    row
                  >
                    <v-flex
                      lg8
                      md11
                      xs10
                    >
                      <AppFooter
                        :class="{'mt-3 mb-4': $vuetify.breakpoint.mdAndDown, 'my-6': $vuetify.breakpoint.lgAndUp}"
                        float
                      />
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import { mapState } from 'vuex';
  import AppFooter from '@/components/App/AppFooter';
  import Logo from '@/components/App/Logo.vue';

  export default {
    middleware: ['route', 'setLocaleByCookie', 'setLocaleByQuery'],
    components: {
      AppFooter,
      Logo,
    },
    computed: {
      ...mapState('app', ['currentRoute']),
      isRegisterPage() {
        return this.route === 'register';
      },
      route() {
        switch (true) {
          case this.currentRoute.includes('/auth'):
            return 'auth';
          case this.currentRoute.includes('/password/forgot'):
          case this.currentRoute.includes('/password/reset'):
            return 'password';
          case this.currentRoute.includes('/register'):
            return 'register';
          case this.currentRoute.includes('/join-team'):
            return 'team';
        }

        return null;
      },
    },
  };
</script>

<style lang="stylus">
  .v-card--rounded
    border-radius: 15px
    overflow: hidden

  .auth-background .v-image__image
    background-size: unset
</style>

<style lang="stylus" scoped>
  @media (max-aspect-ratio: 4 / 3)
    .v-content
      &.full-height
        height: 100vh
</style>
