pgp-universal.xpi: $(wildcard *.js *.json)
	zip -r $@ $+

clean:
	rm -rfv *.xpi
