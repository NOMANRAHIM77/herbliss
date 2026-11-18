"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ArrowRight, Leaf, X } from "lucide-react";
import { StoreImage } from "@/components/store-image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ingredients,
  ingredientProducts,
  ingredientLibrary as copy,
  type IngredientEntry,
} from "@/content/ingredient-library";

export function IngredientLibrary() {
  const [selected, setSelected] = useState<IngredientEntry | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const dialog = useRef<HTMLDialogElement>(null);
  const [plugins] = useState(() => [
    AutoScroll({
      playOnInit: true,
      speed: 0.8,
      startDelay: 300,
      stopOnInteraction: true,
      stopOnMouseEnter: false,
      stopOnFocusIn: true,
    }),
  ]);

  useEffect(() => {
    if (!api) return;
    const viewport = api.rootNode();
    let dragging = false;
    let reading =
      viewport.contains(document.activeElement) &&
      document.activeElement?.matches(":focus-visible") === true;

    const synchronize = (delay = 0) => {
      const plugin = api.plugins().autoScroll;
      if (!plugin) return;
      if (
        selected === null &&
        !document.hidden &&
        !dragging &&
        !reading &&
        api.scrollSnapList().length > 1
      ) {
        plugin.play(delay);
      } else {
        plugin.stop();
      }
    };
    const onReady = () => synchronize();
    const onPointerDown = () => {
      dragging = true;
      synchronize();
    };
    const onPointerUp = () => {
      dragging = false;
      synchronize(300);
    };
    const onFocus = () => {
      reading = true;
      synchronize();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        viewport.contains(event.relatedTarget)
      )
        return;
      reading = false;
      synchronize();
    };

    api.on("reInit", onReady);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);
    api.on("slideFocusStart", onFocus);
    viewport.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onReady);
    synchronize();

    return () => {
      api.off("reInit", onReady);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
      api.off("slideFocusStart", onFocus);
      viewport.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onReady);
      api.plugins().autoScroll?.stop();
    };
  }, [api, selected]);

  function openImage(ingredient: IngredientEntry) {
    setSelected(ingredient);
    dialog.current?.showModal();
  }

  return (
    <section
      id="ingredient-library"
      className="border-brand-deep/10 relative overflow-hidden border-y bg-[#fdfcf8] py-14 sm:py-20"
      aria-labelledby="ingredient-library-title"
    >
      <div
        className="bg-primary/10 pointer-events-none absolute -top-24 -right-20 size-80 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl min-w-0 px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-deep mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
            <Leaf size={16} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2
            id="ingredient-library-title"
            className="text-3xl leading-tight font-medium tracking-[-0.05em] outline-none sm:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-7">
            {copy.description}
          </p>
        </div>

        <p id="ingredient-motion-help" className="sr-only">
          {copy.motionHelp}
        </p>
        <Carousel
          id="ingredient-cards"
          opts={{ align: "start", loop: true, dragFree: true }}
          plugins={plugins}
          setApi={setApi}
          aria-label={copy.title}
          aria-describedby="ingredient-motion-help"
          aria-live="off"
          tabIndex={0}
          className="focus-visible:outline-brand-deep mt-7 w-full min-w-0 [mask-image:linear-gradient(to_right,transparent,#000_var(--edge-fade),#000_calc(100%_-_var(--edge-fade)),transparent)] [--edge-fade:1.5rem] focus-within:[mask-image:none] focus-visible:outline-2 focus-visible:outline-offset-4 sm:[--edge-fade:3rem] lg:[--edge-fade:4rem]"
        >
          <CarouselContent className="touch-pan-y touch-pinch-zoom items-stretch">
            {ingredients.map((ingredient, index) => (
              <CarouselItem
                key={ingredient.id}
                aria-label={`${ingredient.name}, ${index + 1} of ${ingredients.length}`}
                className="flex basis-[76%] sm:basis-[44%] lg:basis-[21%] xl:basis-1/5"
              >
                <article className="group border-brand-deep/15 text-foreground flex w-full flex-col overflow-hidden rounded-xl border bg-white">
                  <button
                    type="button"
                    onClick={() => openImage(ingredient)}
                    aria-label={copy.enlarge + " " + ingredient.name}
                    className="focus-visible:outline-brand-deep relative block w-full overflow-hidden text-left focus-visible:-outline-offset-4"
                  >
                    <StoreImage
                      src={"/images/ingredients/" + ingredient.id + ".png"}
                      alt={ingredient.alt}
                      width={1536}
                      height={1024}
                      draggable={false}
                      sizes="(max-width: 639px) 76vw, (max-width: 1023px) 44vw, (max-width: 1279px) 21vw, 240px"
                      className="block aspect-[3/2] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none"
                    />
                  </button>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-brand-deep text-[9px] font-semibold tracking-[0.14em] uppercase">
                      {ingredient.family}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
                      {ingredient.name}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {ingredient.alternateName}
                    </p>
                    <p className="text-brand-deep mt-3 text-xs font-semibold">
                      {ingredient.benefit}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-5">
                      {ingredient.description}
                    </p>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="ingredient-image-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,1100px)] overflow-auto rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/70"
      >
        {selected && (
          <>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <h2 id="ingredient-image-title" className="text-lg font-semibold">
                {selected.name}
              </h2>
              <button
                type="button"
                autoFocus
                onClick={() => dialog.current?.close()}
                aria-label={copy.close}
                className="bg-secondary hover:bg-primary flex size-11 shrink-0 items-center justify-center rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <StoreImage
              src={"/images/ingredients/" + selected.id + ".png"}
              alt={selected.alt}
              width={1536}
              height={1024}
              sizes="(max-width: 1100px) 94vw, 1100px"
              className="h-auto w-full"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-muted-foreground text-xs">
                {selected.note ?? "AI-generated ingredient illustration."}
              </p>
              <Link
                href={ingredientProducts[selected.products[0]].href}
                onClick={() => dialog.current?.close()}
                className="text-brand-deep inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
              >
                Explore{" "}
                {ingredientProducts[selected.products[0]].label.toLowerCase()}
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
