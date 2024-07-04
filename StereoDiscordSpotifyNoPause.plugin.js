/**
 * @name StereoDiscordSpotifyNoPause
 * @version 0.0.2
 * @description This will make your voice clear and stereo, in the same plugin, you will also get the SpotifyNoPause plugin, so this plugin includes Stereo and SpotifyNoPause.
 * @authorLink https://discord.com/users/997016243741667379
 * @website https://github.com/justfariss
 * @source https://github.com/justfariss/StereoDiscord
 * @donate https://drive.google.com/file/d/1G5L4UBcv9ceB73rAvgAlg0qWWSmVbfBg/view
 * @invite motionime
 * @updateUrl https://raw.githubusercontent.com/justfariss/StereoDiscordSpotifyNoPause/main/StereoDiscordSpotifyNoPause.plugin.js
 */
const NameSC = "StereoDiscordSpotifyNoPause"
module.exports = (() => {
  const config = {
    main: "index.js",
    info: {
      name: NameSC,
      authors: [{ name: "Just F", discord_id: "997016243741667379" }],
      version: "0.0.2",
      description:
        "This will make your voice clear and stereo, in the same plugin, you will also get the SpotifyNoPause plugin, so this plugin includes Stereo and SpotifyNoPause.",
    },
    changelog: [
      {
        title: "New Features",
        items: [
          "Now Supported with Latest Batterdiscord and Powerful Stereo Features",
        ],
      },
      {
        title: "Add Features ! ! !",
        items: [
          "Add SpotifyNoPause Feature into this Plugin feature",
        ],
      },
    ],
    defaultConfig: [
      {
        type: "dropdown",
        id: "stereoChannelOption",
        name: "Stereo Channel Option",
        note: "Select your preferred channel option",
        value: "7.2",
        options: [
          { label: "1.0", value: "1.0" },
          { label: "2.0", value: "2.0" },
          { label: "7.1", value: "7.1" },
          { label: "7.2", value: "7.2" },
        ],
      },
      {
        type: "category",
        id: "otherSettings",
        name: "Other Features",
        shown: true,
        settings: [
          {
            type: "switch",
            id: "enableToasts",
            name: "Enable notifications",
            note: "Warning for Discord Audio Features",
            value: true,
          },
        ],
      },
    ],
  };
  return !global.ZeresPluginLibrary
    ? class {
        constructor() {
          this._config = config;
        }
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.authors.map((a) => a.name).join(", ");
        }
        getDescription() {
          return config.info.description;
        }
        getVersion() {
          return config.info.version;
        }
        load() {
          BdApi.showConfirmationModal(
            NameSC+" Library Missing",
            `ZeresPluginLibrary is missing. Click "Install Now" to download it.`,
            {
              confirmText: "Install Now",
              cancelText: "Cancel",
              onConfirm: () => {
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error) {
                      console.error("Error downloading ZeresPluginLibrary:", error);
                      BdApi.showConfirmationModal(
                        "Download Error",
                        "An error occurred while downloading ZeresPluginLibrary. Please try again later or download it manually from the official website.",
                        {
                          confirmText: "OK",
                          cancelText: "Cancel",
                        }
                      );
                      return;
                    }

                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          BdApi.Plugins.folder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                  }
                );
              },
            }
          );
        }
      }
    : (([Plugin, Api]) => {

      const plugin = (Plugin, Library) => {
        const { WebpackModules, Patcher, Toasts } = Library;

        return class StereoDiscordSpotifyNoPause extends Plugin {
          // plugin start method
          onStart() {
            this.settingsWarning();
            this.justJoined = false;
            if (!this.justJoined) {
            XMLHttpRequest.prototype.realOpen = XMLHttpRequest.prototype.open;
            var myOpen = function(method, url, async, user, password) {
            if (url == "https://api.spotify.com/v1/me/player/pause") {
            url = "https://api.spotify.com/v1/me/player/play";
            }
            this.realOpen (method, url, async, user, password);
            }
            XMLHttpRequest.prototype.open = myOpen;
            Toasts.show("SpotifyNoPause is on ENJOY ! ! !", { type: "info", timeout: 5000 });
              this.justJoined = true;
            }
            const voiceModule = WebpackModules.getModule(
              BdApi.Webpack.Filters.byPrototypeFields("updateVideoQuality")
            );
            
            BdApi.Patcher.after(
              "StereoDiscordSpotifyNoPause",
              voiceModule.prototype,
              "updateVideoQuality",
              (thisObj, _args, ret) => {
                if (thisObj) {
                  const setTransportOptions = thisObj.conn.setTransportOptions;
                  const channelOption = this.settings.stereoChannelOption;

                  thisObj.conn.setTransportOptions = function (obj) {
                    if (obj.audioEncoder) {
                      obj.audioEncoder.params = {
                        stereo: channelOption,
                      };
                      obj.audioEncoder.channels = parseFloat(channelOption);
                      obj.audioEncoder.freq = 384000;
                      obj.audioEncoder.rate = 192;
                      obj.audioEncoder.pacsize = 20 * 2;
                    }
                    if (obj.fec) {
                      obj.fec = false; 
                    }
                    if (obj.encodingVoiceBitRate < 7000500*26) {
                      obj.encodingVoiceBitRate = 7000500*26;
                    }

                    
                    if (obj.audioEncoder && obj.audioEncoder.params) {
                      obj.audioEncoder.params.enable_high_pass_filter = false;
                      obj.audioEncoder.params.enable_analog_gain_controller = false;
                    }

                    setTransportOptions.call(thisObj, obj);
                  };
                  return ret;
                }
              }
            );

              const speakingPayload = {
                op: 5,
                d: {
                  speaking: 5,
                  delay: 0,
                  ssrc: 1,
                },
              };

              
              BdApi.findModuleByProps("sendPayload").sendPayload(
                speakingPayload
              );
          }

          
          settingsWarning() {
            const voiceSettingsStore = WebpackModules.getByProps(
              "getEchoCancellation"
            );
            if (
              voiceSettingsStore.getNoiseSuppression() ||
              voiceSettingsStore.getNoiseCancellation() ||
              voiceSettingsStore.getEchoCancellation()
            ) {
              if (this.settings.enableToasts) {
                
                Toasts.show(
                  "Please turn off Echo Cancellation and Noise Suppresion to None, if you want to use StereoDiscord, otherwise no need.",
                  { type: "warning", timeout: 5000 }
                );
              }
              return true;
            } else return false;
          }
          
          onStop() {
            Patcher.unpatchAll();
            XMLHttpRequest.prototype.open = XMLHttpRequest.prototype.realOpen;
          }
          
          getSettingsPanel() {
            const panel = this.buildSettingsPanel();
            const noteElement = document.createElement("div");
            noteElement.className = "StereoDiscordSpotifyNoPause-settings-note";
            noteElement.textContent = "Note : If you want to use this StereoDiscord script, you must re-join the voice so that this plugin setting works. But if you just use SpotifyNoPause, you don't need to re-join at all, you just turn on the Plugin.";
            noteElement.style.color = "#FF0000";
            noteElement.style.marginTop = "10px";
            panel.append(noteElement);
            return panel.getElement();
          }
        };
      };
      return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();