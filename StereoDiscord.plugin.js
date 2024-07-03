/**
 * @name StereoDiscord
 * @version 0.0.4
 * @description Adds stereo sound to Discord. Better Discord v1.9.3
 * @authorLink https://github.com/justfariss
 * @website https://github.com/justfariss
 * @source https://github.com/justfariss
 * @invite motionime
 * @updateUrl https://github.com/justfariss
 */
var NameSC = "StereoDiscord"
module.exports = (() => {
  const config = {
    main: "index.js",
    info: {
      name: NameSC,
      authors: [{ name: "Just F", discord_id: "997016243741667379" }],
      version: "0.0.1",
      description:
        "So that your discord sound can be stereo and also clear",
    },
    changelog: [
      {
        title: "New Features",
        items: [
          "Now Supported with Latest Batterdiscord and Powerful Stereo Features",
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
        shown: false,
        settings: [
          {
            type: "switch",
            id: "enableToasts",
            name: "Enable notifications",
            note: "Warning for Discord Audio Features",
            value: true,
          },
          {
            type: "switch",
            id: "prioritySpeaking",
            name: "Priority Speaking", // added
            note: "Enable Priority Speaking feature",
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
            NameSC + "Plugin Missing",
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
        start() {}
        stop() {}
      }
    : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
          const { WebpackModules, Patcher, Toasts } = Library;

          return class StereoDiscord extends Plugin {
            onStart() {
              this.settingsWarning();
              const voiceModule = WebpackModules.getModule(
                BdApi.Webpack.Filters.byPrototypeFields("updateVideoQuality")
              );
              BdApi.Patcher.after("StereoDiscord",voiceModule.prototype,"updateVideoQuality", (thisObj, _args, ret) => {
                  if (thisObj) {
                    const setTransportOptions = thisObj.conn.setTransportOptions;
                    const channelOption = this.settings.stereoChannelOption;
                    const selectedBitrate = this.settings.bitrateOption; 

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


              if (this.settings.prioritySpeaking) {
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
                    "Please turn off Echo Cancellation and Noise Suppresion to None, to use the Plugin "+NameSC,
                    { type: "warning", timeout: 5000 }
                  );
                }
                return true;
              } else return false;
            }

            onStop() {
              Patcher.unpatchAll();
            }
            getSettingsPanel() {
              const panel = this.buildSettingsPanel();
              const noteElement = document.createElement("div");
              noteElement.className = NameSC+"-settings-note";
              noteElement.textContent = "Note: After changing any setting, please rejoin the voice channel for the changes to take effect.";
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