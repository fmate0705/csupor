/**
 * GENERATED FILE — do not edit.
 * Written by scripts/build-assets.mjs. Run `pnpm assets` to regenerate.
 *
 * Describes every image in public/images: the master dimensions, which widths
 * were emitted, and an inline blurred placeholder.
 */
export interface ImageEntry {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  readonly blurDataURL: string;
}

export const imageManifest = {
  "hero-terasz-sor": {
    "width": 1904,
    "height": 1428,
    "widths": [
      480,
      768,
      1024,
      1440,
      1904
    ],
    "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoQAAwAA4BaJagCdADZIXKAAP4ZoxJ9CfSkWuCKfNhdqyqLOH6+jP9+/tztdzqYBVD6sEl8PkAAAA=="
  },
  "terasz-esti": {
    "width": 1360,
    "height": 764,
    "widths": [
      480,
      768,
      1024,
      1360
    ],
    "blurDataURL": "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoQAAkAA4BaJZQAAqzaUdC3oAD9dTFJHQInMicSMW6dZ2p9IMAHgAAA"
  },
  "terasz-nappali": {
    "width": 1360,
    "height": 1020,
    "widths": [
      480,
      768,
      1024,
      1360
    ],
    "blurDataURL": "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAACwAQCdASoQAAwAA4BaJZQAAsfw+J4AAM3SsKiFUhIkHb4fzwYM/Ayi5LFpTe9gOAA="
  },
  "sorfozes-kozben": {
    "width": 680,
    "height": 1020,
    "widths": [
      480,
      680
    ],
    "blurDataURL": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAAAQBACdASoQABgAPu1iqk2ppaQiMAgBMB2JYwC06Be+eNHFx9dUXHx0QAD+1OSSvRrOXI9ae42FwJa39M+Wo0+OqGlfCoDSdcHi03A+dpCd8CDSRy5khSpQTEkYav/dCAA="
  },
  "sorfozes-tartaly": {
    "width": 340,
    "height": 510,
    "widths": [
      340
    ],
    "blurDataURL": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAQBACdASoQABgAPu1kqU2ppaQiMAgBMB2JZwC/OCDkKMvofAiDttAjgADOHnlBDGmoridz5FRGjScnvpDe6nyqNpPEYiq/5Xhttc+fVPZ/ahX6WkwAAA=="
  },
  "pohar-a-fozdeben": {
    "width": 764,
    "height": 1020,
    "widths": [
      480,
      764
    ],
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADQAwCdASoQABUAPu1krU6ppaSiMAgBMB2JZwDLLBuliFbY0nBa4aAA99BxTKITIi+GUs7WhXucHhK2CenyuRl5ZZbpAxWLeMKgJDAA"
  },
  "fozde-berendezes": {
    "width": 382,
    "height": 510,
    "widths": [
      382
    ],
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAwCdASoQABUAPu1kq04ppaQiMAgBMB2JQBOl4AA0Zuu3REuvdWWgAPeH4uUo4+iD1YOJteeHi18DTsnupMgefy719aCY25veYwAA"
  },
  "csapat": {
    "width": 1360,
    "height": 628,
    "widths": [
      480,
      768,
      1024,
      1360
    ],
    "blurDataURL": "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAACQAQCdASoQAAcAA4BaJZwAAtX43KAA/deyvDHXviIu20HgAAA="
  },
  "sorfozde-alkonyat": {
    "width": 770,
    "height": 906,
    "widths": [
      480,
      768,
      770
    ],
    "blurDataURL": "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAQBACdASoQABMAPu1iqU2ppaOiMAgBMB2JZACdMoMrZEJCN58GJEO1wAD5CJ+JwQ4+nFmw3LRXQAxwk8WxadrSuyU7Rza6ivuiymYmWxUVJwg5WAAAAA=="
  },
  "tartaly-kulteri": {
    "width": 574,
    "height": 448,
    "widths": [
      480,
      574
    ],
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAgCdASoQAAwAA4BaJYgCdADp4/qaO6KAAM4zV5aAHrDxWC+Q90V3odI7dmowdYox5p18UpaEAA=="
  },
  "sorfozde-viragok": {
    "width": 574,
    "height": 450,
    "widths": [
      480,
      574
    ],
    "blurDataURL": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoQAA0AA4BaJagCdAEfwFqJ3egA/Xjrbdo5iOdBGc8ODLD73219fM/3LRMRikXAAAA="
  }
} as const satisfies Record<string, ImageEntry>;

export type PhotoName = keyof typeof imageManifest;
