# Tests

## Message Body
All the messages in this directory share the same plaintext message body that
should be displayed by Thunderbird:

```
Hey there,

this is just some arbitrary test message.

bye.
```

## Attachments

All message have attached the HTML version of the message body as
`PGPexch.htm.pgp`. The filename is already correct in the standard header so
the plugin should not rewrite it.

Additional to that all of the following e-mails have the same photo of a kitten
attached, but the filename differs. Note that the plugin should attach the
`.pgp` suffix as the attachments are not decrypted automatically. The expected
filenames are:
- `example.eml': `image001.jpg.pgp`
- `long_filename.eml`: `cute_cat_in_the_woods.jpg.pgp` with no space in it
- `rfc2047.eml`: `süße Katze.jpg.pgp` with a space in it
- `rfc2047_long_filename.eml`: `Süße_Katze_im_grünen_Wald.jpg.pgp` with no
  space in it

The e-mail `event.ics` has a calender event attached. Those don't have filename
information. The plugin is suppossed to renamed it to `Event.ics.pgp`.
