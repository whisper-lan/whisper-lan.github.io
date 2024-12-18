/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, MotionValue } from "framer-motion";
import { useLanguage } from '@/hooks/useLanguage';
import { SITE_CONFIG } from "@/lib/constants";

// 语言配置
const messages = {
  'zh-CN': {
    title: 'whisper',
    description: '快速、简单、对话式的局域网文件传输应用, 支持多设备, 转发安卓设备通知 启动一个FTP服务(alpha)',
    buttons: {
      download: '立即下载',
      learnMore: '了解更多'
    },
    platforms: {
      windows: 'Windows',
      mac: 'MacOS',
      linux: 'Linux',
      android: '安卓',
      ios: 'iOS'
    },
    status: {
      recommended: '推荐',
      developing: 'ipa',
      comingSoon: '暂无计划',
      iosInDev: '可从github下载ipa'
    },
    download: {
      starting: '下载已开始，请稍候...',
      failed: '下载失败，请稍后重试',
      notAvailable: '{platform}版本暂未发布'
    },
    version: {
      current: '当前版本',
      changelog: '更新日志'
    },
    features: {
      title: '特色功能',
      items: {
        chat: {
          title: '聊天式传输',
          description: '像聊天一样发送文件，支持快速分享剪贴板文本，简单直观的操作体验'
        },
        notification: {
          title: '通知同步',
          description: '支持转发安卓设备通知消息，让您不错过任何重要信息'
        },
        ftp: {
          title: 'FTP 服务',
          description: '一键启动 FTP 服务端(alpha)，支持多种传输方式，满足不同场景需求'
        }
      }
    },
    faq: {
      title: '常见问题',
      items: [
        {
          q: '如何使用 Whisper?',
          a: '只需下载并安装对应平台的应用程序，在同一局域网内的设备上运行即可自动发现并建立连接。'
        },
        {
          q: '支持哪些文件类型？',
          a: '支持所有类型的文件传输，无大小限制，但是请注意本地剩余空间。'
        },
        {
          q: '传输速度如何？',
          a: '传输速度取决于局域网络带宽，通常可充分利用网络带宽，传输速度非常快。'
        },
        {
          q: '数据是否安全？',
          a: '因为考虑到是本地设备使用，暂未使用加密手段，请勿传输敏感数据，后续可以考虑添加加密传输。'
        },
        {
          q: '是否支持断点传输？',
          a: '暂不支持'
        },
        {
          q: '是否支持多线程传输？',
          a: '暂不支持'
        },
        {
          q: 'PC端是否支持键鼠操作另一台桌面?',
          a: '暂不支持'
        }
      ]
    },
    tutorial: {
      title: '使用教程',
      steps: [
        {
          title: '下载安装',
          desc: '选择对应平台下载并安装应用'
        },
        {
          title: '启动应用',
          desc: '在需要传输文件的设备上运行 Whisper'
        },
        {
          title: '选择设备',
          desc: '从设备列表中选择目标设备'
        },
        {
          title: '发送文件',
          desc: '拖拽文件或点击选择文件即可开始传输'
        }
      ]
    },
    testimonials: {
      title: '用户反馈',
      items: [
        {
          content: '界面设计非常简洁清爽,使用起来特别方便。最喜欢的是可以直接拖拽文件传输,完全不需要复杂的设置。传输速度也很快,对于局域网内的文件共享来说是个很好的选择。'
        },
        {
          content: '终于找到一个好用的局域网传输工具了!之前用过很多类似的软件,要么界面复杂,要么需要配置,这个应用完全解决了我的需求。特别是跨平台支持做得很好,在手机和电脑之间传文件变得特别容易。'
        },
        {
          content: '作为一个经常需要在不同设备间传输文件的人来说,这个工具帮了大忙。通知同步功能很实用,两部手机再也不用担心没看到消息了。希望后续能加入更多功能,比如多设备同时传输。'
        },
        {
          content: '非常喜欢这款软件的聊天式界面,让文件传输变得像聊天一样自然。剪贴板同步功能对工作效率提升很大,经常用来分享代码片段。'
        },
        {
          content: '安装简单,打开就能用,完全不需要配置。对于我这种不太懂技术的人来说特别友好。最近都在用它传输课件和学习资料,很方便。'
        },
        {
          content: '终于可以不用文件传输助手了'
        }
      ]
    },
    footer: {
      about: {
        title: '关于我们',
        content: 'Whisper 是一个开源的局域网文件传输工具，致力于为用户提供简单、快速、可靠的文件传输体验。我们的目标是让文件共享变得像聊天一样简单自然。'
      },
      privacy: {
        title: '隐私政策',
        content: '我们重视您的隐私。Whisper 不会收集任何个人信息，所有数据传输仅在局域网内进行。我们不会存储或上传您的任何文件和信息。'
      },
      contact: {
        title: '联系我们',
        email: 'support@whisper.com',
        github: 'GitHub Issues'
      },
      links: {
        sourceCode: '源代码',
        report: '问题反馈',
        sponsor: '赞助支持'
      }
    }
  },
  'en': {
    title: 'whisper',
    description: 'Fast, Simple, Chat-style LAN file transfer. support multi-device transfer, Android notification sync, start a FTP server (alpha)',
    buttons: {
      download: 'Download',
      learnMore: 'Learn More'
    },
    platforms: {
      windows: 'Windows',
      mac: 'MacOS',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS'
    },
    status: {
      recommended: 'current',
      developing: 'ipa',
      comingSoon: 'experimental',
      iosInDev: 'download from github'
    },
    download: {
      starting: 'Download starting, please wait...',
      failed: 'Download failed, please try again',
      notAvailable: '{platform} version is not available yet'
    },
    version: {
      current: 'Current Version',
      changelog: 'Changelog'
    },
    features: {
      title: 'Features',
      items: {
        chat: {
          title: 'Chat-style Transfer',
          description: 'Send files like chatting, support quick clipboard sharing, simple and intuitive operation'
        },
        notification: {
          title: 'Notification Sync',
          description: 'Forward Android device notifications, never miss important messages'
        },
        ftp: {
          title: 'FTP Service',
          description: 'One-click FTP server (alpha), supports multiple transfer methods for different scenarios'
        }
      }
    },
    faq: {
      title: 'FAQ',
      items: [
        {
          q: 'How to use Whisper?',
          a: 'Simply download and install the application for your platform, run it on devices in the same local network and they will automatically discover and connect to each other.'
        },
        {
          q: 'What file types are supported?',
          a: 'All file types are supported with no size limit, but please be mindful of available local storage space.'
        },
        {
          q: 'How fast is the transfer speed?',
          a: 'Transfer speed depends on your local network bandwidth. It typically utilizes the full network bandwidth, resulting in very fast transfers.'
        },
        {
          q: 'Is the data transfer secure?',
          a: 'Since it\'s designed for local device use, encryption is not currently implemented. Please avoid transferring sensitive data. Encrypted transfer may be added in future updates.'
        },
        {
          q: 'Is resume support available for interrupted transfers?',
          a: 'Not currently supported'
        },
        {
          q: 'Is multi-threaded transfer supported?',
          a: 'Not currently supported'
        },
        {
          q: 'Can PC version control mouse/keyboard of another desktop?',
          a: 'Not currently supported'
        }
      ]
    },
    tutorial: {
      title: 'How to Use',
      steps: [
        {
          title: 'Download & Install',
          desc: 'Download and install the app for your platform'
        },
        {
          title: 'Launch App',
          desc: 'Run Whisper on devices that need to transfer files'
        },
        {
          title: 'Select Device',
          desc: 'Choose target device from the device list'
        },
        {
          title: 'Send Files',
          desc: 'Drag and drop or click to select files to start transfer'
        }
      ]
    },
    testimonials: {
      title: 'User Feedback',
      items: [
        {
          content: 'The interface is clean and intuitive. I love how I can just drag and drop files to transfer. The speed is impressive for LAN file sharing, and it has become my go-to tool for local network transfers.'
        },
        {
          content: 'Finally found a great LAN transfer tool! I have tried many similar apps before, but this one stands out with its simplicity and efficiency. The cross-platform support is excellent, making file transfer between devices a breeze.'
        },
        {
          content: 'As someone who frequently transfers files between devices, this tool has been a game-changer. The notification sync feature is particularly useful. Looking forward to seeing more features like multi-device transfer in future updates.'
        },
        {
          content: 'Love the chat-style interface, it makes file transfer feel natural and intuitive. The clipboard sync feature has greatly improved my workflow, especially when sharing code snippets.'
        },
        {
          content: 'Easy to install and use right away, no configuration needed. As someone who is not very tech-savvy, I really appreciate the user-friendly approach. Perfect for sharing study materials!'
        }, {
          content: 'Finally, found a good tool for local network file transfer'
        }
      ]
    },
    footer: {
      about: {
        title: 'About Us',
        content: 'Whisper is an open-source LAN file transfer tool dedicated to providing users with a simple, fast, and reliable file transfer experience. Our goal is to make file sharing as simple and natural as chatting.'
      },
      privacy: {
        title: 'Privacy Policy',
        content: 'We value your privacy. Whisper does not collect any personal information, and all data transfers occur only within the local network. We do not store or upload any of your files or information.'
      },
      contact: {
        title: 'Contact Us',
        email: 'support@whisper.com',
        github: 'GitHub Issues'
      },
      links: {
        sourceCode: 'Source Code',
        report: 'Report Issues',
        sponsor: 'Sponsor'
      }
    }
  }
};

// 平台类型定义
type PlatformType = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'unknown';

// 设备检测hook
const useDeviceDetect = () => {
  const [deviceType, setDeviceType] = useState<PlatformType>('unknown');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/android/i.test(userAgent)) {
      setDeviceType('android');
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      setDeviceType('ios');
    } else if (userAgent.includes('win')) {
      setDeviceType('windows');
    } else if (userAgent.includes('mac')) {
      setDeviceType('mac');
    } else if (userAgent.includes('linux')) {
      setDeviceType('linux');
    }
  }, []);

  return deviceType;
};

// 平台图标组件
const PlatformIcon = {
  Windows: () => (
    <svg className="w-8 h-8 mx-auto text-gray-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  ),
  MacOS: () => (
    <svg className="w-8 h-8 mx-auto text-gray-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  ),
  Linux: () => (
    <svg className="w-8 h-8 mx-auto text-gray-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z" />
    </svg>
  ),
  Android: () => (
    <svg className="w-8 h-8 mx-auto text-gray-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4094 13.8533 8 12 8s-3.5902.4094-5.1367.9597L4.841 5.4662a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
    </svg>
  ),
  iOS: () => (
    <svg className="w-8 h-8 mx-auto text-gray-600" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
};

// 设备类型判断
const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// 添加下载配置
const GITHUB_REPO = {
  owner: 'lawnvi',
  repo: 'whisper',
  releaseApi: 'https://api.github.com/repos/lawnvi/whisper/releases/latest',
  repoUrl: 'https://github.com/lawnvi/whisper',
  repoReleaseUrl: 'https://github.com/lawnvi/whisper/releases',
};

// 平台对应的文件后缀名映射
const PLATFORM_FILE_SUFFIX = {
  windows: '.exe',
  mac: '.dmg',
  // linux: '.AppImage',
  linux: '.deb',
  android: 'app-release.apk',
  ios: '.ipa.bak'
} as const;

// 定义平台下载信息类型
type PlatformDownloadInfo = {
  url: string;
  size: string;
  version: string;
};

type DownloadInfo = {
  [key in PlatformType]: PlatformDownloadInfo;
};

// 添加 FAQ 组件
const FAQSection = () => {
  const { language } = useLanguage();
  const t = messages[language];

  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">{t.faq.title}</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {t.faq.items.map((item, index) => (
          <div key={index} className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">{item.q}</h3>
            <p className="text-gray-600 dark:text-gray-300">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 添加教程组件
const TutorialSection = () => {
  const { language } = useLanguage();
  const t = messages[language];

  return (
    <section className="container mx-auto px-4 py-20 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-3xl font-bold text-center mb-12">{t.tutorial.title}</h2>
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {t.tutorial.steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// 添加评价组件
const TestimonialsSection = () => {
  const { language } = useLanguage();
  const t = messages[language];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % t.testimonials.items.length);
    }, 5000); // 每5秒切换一次

    return () => clearInterval(timer);
  }, [t.testimonials.items.length]);

  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">{t.testimonials.title}</h2>
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-white/50 dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {t.testimonials.items[currentIndex].content}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// 添加页脚组件
const Footer = () => {
  const { language } = useLanguage();
  const t = messages[language];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 关于我们 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{t.footer.about.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t.footer.about.content}
            </p>
          </div>

          {/* 隐私政策 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{t.footer.privacy.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t.footer.privacy.content}
            </p>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{t.footer.contact.title}</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                {/* Email: {t.footer.contact.email} */}
              </p>
              <div className="flex space-x-4">
                <a
                  href={`${GITHUB_REPO.repoUrl}/issues`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {t.footer.links.report}
                </a>
                <a
                  href={GITHUB_REPO.repoUrl}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {t.footer.links.sourceCode}
                </a>
                <a
                  href={`${GITHUB_REPO.repoUrl}/sponsors`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {t.footer.links.sponsor}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} whisper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// 在 Download Section 之前添加一个函数来重新排序平台
const reorderPlatforms = (platforms: any[], currentPlatform: PlatformType) => {
  // 找到推荐平台的索引
  const recommendedIndex = platforms.findIndex((p: { recommended: any; }) => p.recommended);
  if (recommendedIndex === -1) return platforms;

  // 计算中间位置
  const middleIndex = Math.floor(platforms.length / 2);

  // 创建新数组并重新排序
  const reordered = [...platforms];
  // 将推荐平台与中间位置的平台交换
  [reordered[recommendedIndex], reordered[middleIndex]] = [reordered[middleIndex], reordered[recommendedIndex]];

  return reordered;
};

export default function Home() {
  const targetRef = useRef(null);
  const deviceType = useDeviceDetect();
  const isMobile = useDeviceType();
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>({
    windows: { url: '', size: '-', version: '' },
    mac: { url: '', size: '-', version: '' },
    linux: { url: '', size: '-', version: '' },
    android: { url: '', size: '-', version: '' },
    ios: { url: '', size: '-', version: '' },
    unknown: { url: '', size: '-', version: '' }
  });
  const { language } = useLanguage();
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages[language];
    for (const k of keys) {
      value = value[k];
    }
    return value as string;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取下载信息
  useEffect(() => {
    const fetchReleaseInfo = async () => {
      try {
        const response = await fetch(GITHUB_REPO.releaseApi);
        const data = await response.json();

        setCurrentVersion(data.tag_name.replace('dev-v', ''));

        // 创建新的下载信息对象
        const newDownloadInfo: DownloadInfo = {
          windows: { url: '', size: '-', version: '' },
          mac: { url: '', size: '-', version: '' },
          linux: { url: '', size: '-', version: '' },
          android: { url: '', size: '-', version: '' },
          ios: { url: '', size: '-', version: '' },
          unknown: { url: '', size: '-', version: '' }
        };

        // 遍历所有资源文件
        data.assets.forEach((asset: any) => {
          const fileName = asset.name.toLowerCase();
          // 根据文件后缀匹配平台
          Object.entries(PLATFORM_FILE_SUFFIX).forEach(([platform, suffix]) => {
            if (fileName.endsWith(suffix)) {
              newDownloadInfo[platform as PlatformType] = {
                url: asset.browser_download_url,
                size: formatFileSize(asset.size),
                version: data.tag_name
              };
            }
          });
        });

        setDownloadInfo(newDownloadInfo);
      } catch (error) {
        console.error('获取版本信息失败:', error);
        showMessage('获取版本信息失败，请稍后重试');
      }
    };

    fetchReleaseInfo();
  }, []);

  // 更新 downloads 数组
  const downloads = [
    {
      icon: <PlatformIcon.Windows />,
      name: t('platforms.windows'),
      platform: 'windows' as PlatformType,
      size: downloadInfo.windows.size,
      recommended: deviceType === 'windows',
      available: !!downloadInfo.windows.url
    },
    {
      icon: <PlatformIcon.MacOS />,
      name: t('platforms.mac'),
      platform: 'mac' as PlatformType,
      size: downloadInfo.mac.size,
      recommended: deviceType === 'mac',
      available: !!downloadInfo.mac.url
    },
    {
      icon: <PlatformIcon.Linux />,
      name: t('platforms.linux'),
      platform: 'linux' as PlatformType,
      size: downloadInfo.linux.size,
      recommended: deviceType === 'linux',
      available: !!downloadInfo.linux.url
    },
    {
      icon: <PlatformIcon.Android />,
      name: t('platforms.android'),
      platform: 'android' as PlatformType,
      size: downloadInfo.android.size,
      recommended: deviceType === 'android',
      available: !!downloadInfo.android.url
    },
    {
      icon: <PlatformIcon.iOS />,
      name: t('platforms.ios'),
      platform: 'ios' as PlatformType,
      size: t('status.comingSoon'),
      recommended: deviceType === 'ios',
      available: false,
      comingSoon: true,
      disabledText: t('status.iosInDev')
    }
  ];

  // 更新下载处理函数
  const handleDownloadClick = async (platform: PlatformType) => {
    const platformInfo = downloadInfo[platform];
    if (!platformInfo.url) {
      showMessage(`${platform}平台版本暂未发布`);
      return;
    }

    setDownloading(true);
    try {
      // 创建一个隐藏的 iframe 来处理下载
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = platformInfo.url;
      document.body.appendChild(iframe);

      showMessage('下载已开始，请稍候...');

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      showMessage('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  // 显示提示信息
  const showMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 处理快速下载按钮点击
  const handleQuickDownload = () => {
    if (isMobile) {
      // 移动端跳转到下载区域
      const downloadSection = document.getElementById('download');
      if (downloadSection) {
        downloadSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // PC端直接下载对应平台安装包
      const currentPlatform = downloads.find(p => p.recommended) || downloads[0];
      if (!currentPlatform.available) {
        showMessage(`${currentPlatform.name}版本即将上线，敬请期待！`);
        return;
      }
      handleDownloadClick(currentPlatform.platform);
    }
  };

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-background" ref={targetRef}>
        {/* 添加语言切换按钮 */}
        <div className="fixed top-4 right-4 z-50">
          <select
            value={language}
            onChange={(e) => useLanguage.getState().setLanguage(e.target.value as 'en' | 'zh-CN')}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1"
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        <section className="relative container mx-auto px-4 py-20 overflow-hidden">
          <motion.div className="flex flex-col items-center text-center gap-8 relative z-10">
            <motion.h1 className="text-6xl font-bold text-blue-600 md:bg-gradient-to-r md:from-blue-600 md:to-cyan-500 md:bg-clip-text md:text-transparent">
              {t('title')}
            </motion.h1>

            <motion.p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              {t('description')}
            </motion.p>

            <motion.div className="flex gap-4">
              <motion.button
                onClick={handleQuickDownload}
                className="group px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all flex items-center gap-2"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.5)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                <span>{t('buttons.download')}</span>
                {downloading && !isMobile && (
                  <svg className="animate-spin ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isMobile && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </motion.button>

              <motion.a
                href={GITHUB_REPO.repoUrl}
                target="_blank"
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(59, 130, 246, 0.2)"
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
              >
                {t('buttons.learnMore')}
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-blue-600 md:bg-gradient-to-r md:from-blue-600 md:to-cyan-500 md:bg-clip-text md:text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {t('features.title')}
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {introFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500"
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 10
                    },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.1
                      }
                    }
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                >
                  <span className="flex items-center gap-4">
                    <motion.span
                      className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center relative overflow-hidden group"
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <motion.div
                        whileHover={{
                          rotate: 360,
                          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.span>
                    <h3 className="text-xl font-semibold">{t(`features.items.${feature.key}.title`)}</h3>
                  </span>
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        duration: 0.4,
                        delay: index * 0.1 + 0.3
                      }
                    }}
                  >
                    {t(`features.items.${feature.key}.description`)}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Download Section */}
        <motion.section id="download" className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {reorderPlatforms(downloads, deviceType).map((platform: { platform: PlatformType; available: any; recommended: any; icon: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | MotionValue<number> | MotionValue<string> | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; size: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; comingSoon: any; disabledText: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => (
                <motion.button
                  key={index}
                  onClick={() => handleDownloadClick(platform.platform)}
                  disabled={downloading || !platform.available}
                  className={`p-6 border rounded-xl relative overflow-hidden group 
                    ${platform.recommended ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${!platform.available ? 'opacity-80 cursor-not-allowed' : ''}
                  `}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={platform.available ? {
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  } : {}}
                  transition={{
                    duration: 0.5,
                    delay: index as number * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-500/10"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: platform.available ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {platform.icon}
                  <h3 className="text-lg font-semibold mt-4">{platform.name}</h3>
                  <p className="text-sm text-gray-500">
                    {platform.size}
                  </p>
                  {platform.recommended && platform.available && (
                    <span className="absolute top-2 right-2 text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                      {t('status.recommended')}
                    </span>
                  )}
                  {platform.comingSoon && (
                    <span className="absolute top-2 right-2 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                      {t('status.developing')}
                    </span>
                  )}
                  {!platform.available && platform.disabledText && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 dark:bg-gray-800/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {platform.disabledText}
                      </p>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            <p className="mt-8 text-sm text-gray-500">
              {t('version.current')}: v{currentVersion} |
              <a href={GITHUB_REPO.repoReleaseUrl} target="_blank" className="text-blue-600 hover:underline ml-2">
                {t('version.changelog')}
              </a>
            </p>
          </div>
        </motion.section>

        {/* Toast Message */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <FAQSection />

        {/* Tutorial Section */}
        <TutorialSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Footer */}
        <Footer />
      </div>
    </AnimatePresence>
  );
}
const introFeatures = [
  {
    key: 'chat',
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  },
  {
    key: 'notification',
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  },
  {
    key: 'ftp',
    icon: <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  }
];

